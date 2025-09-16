load("language_list.js"); 
var apiKeys = [];
try {
    if (typeof api_keys !== 'undefined' && api_keys) {
        var clean_api_keys = api_keys;
        clean_api_keys = clean_api_keys.replace(/^"([\s\S]*)"$/, "$1");
        apiKeys = (clean_api_keys || "").split('\n') 
            .map(function(k) { return k.trim(); })
            .filter(function(k) { return k !== ""; });
    }
} catch (e) {}

var cacheableModels = [];
try {
    if (typeof modelsavecache !== 'undefined' && modelsavecache) {
        var clean_modelsavecache = modelsavecache;
        clean_modelsavecache = clean_modelsavecache.replace(/^"([\s\S]*)"$/, "$1");
        cacheableModels = (clean_modelsavecache || "").split('\n')
            .map(function(k) { return k.trim(); })
            .filter(function(k) { return k !== ""; });
    }
} catch (e) {}

load("prompt.js");

try {
    function getCleanedConfigString(configVar) {
        if (typeof configVar !== 'undefined' && configVar) {
            var cleanedString = configVar;
            cleanedString = cleanedString.replace(/^"([\s\S]*)"$/, "$1");
            return cleanedString;
        }
        return ""; 
    }
    prompts['vi_tuychon1'] = getCleanedConfigString(prompt_tuychon1);
    prompts['vi_tuychon2'] = getCleanedConfigString(prompt_tuychon2);
    prompts['vi_NameEng'] = getCleanedConfigString(prompt_name_eng);
    prompts['vi_vietlai'] = getCleanedConfigString(prompt_rewrite);
    prompts['vi_tieuchuan'] = getCleanedConfigString(prompt_tieuchuan);
    prompts['vi_sac'] = getCleanedConfigString(prompt_sac);
} catch(e) {}

load("baidutranslate.js");

var modelsucess = "";
var models = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-flash-lite"
];

function generateFingerprintCacheKey(lines) {
    var keyParts = "";
    var linesForId = lines.slice(0, 5); 
    for (var i = 0; i < linesForId.length; i++) {
        var line = linesForId[i].trim();
        if (line.length >= 6) { 
            keyParts += line.substring(0, 3) + line.slice(-3);
        } else {
            keyParts += line;
        }
    }
    return "vbook_fp_cache_" + keyParts;
}

function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    modelsucess = model;
    let maxop = 65536;
    if (model === "gemini-2.0-flash-lite" || model === "gemini-2.0-flash") maxop = 8192
    var full_prompt = prompt + "\n\nDưới đây là văn bản cần xử lý\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "role": "user", "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": parseFloat(temp), "topP": parseFloat(topP), "topK": parseFloat(topK), "maxOutputTokens": maxop },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };
    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        var responseText = response.text(); 

        if (response.ok) {
            var result = JSON.parse(responseText);
            if (result.candidates && result.candidates.length > 0) {
                var candidate = result.candidates[0];
                if (candidate.finishReason === "MAX_TOKENS") {
                    return { status: "error", message: "Dịch bị cắt ngắn do đạt giới hạn token (MAX_TOKENS)." };
                }
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
                    return { status: "success", data: candidate.content.parts[0].text.trim() };
                }
            }
            if (result.promptFeedback && result.promptFeedback.blockReason) { return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason }; }
            if (result.candidates && result.candidates.length > 0 && (!result.candidates[0].content || !result.candidates[0].content.parts)) { return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." }; }
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + responseText };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + ". Phản hồi từ server:\n" + responseText };
        }
    } catch (e) { return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() }; }
}

function translateChunkWithApiRetry(chunkText, prompt, modelToUse, keysToTry) {
    var keyErrors = [];
    for (var i = 0; i < keysToTry.length; i++) {
        var apiKeyToUse = keysToTry[i];
        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);
        
        if (result.status === "success") {
            if ((result.data.length / chunkText.length) < 0.5) {
                result.status = "short_result_error";
                result.message = "Kết quả trả về ngắn hơn 50% so với văn bản gốc.";
            } else {
                return result; 
            }
        }
        
        keyErrors.push("  + Key " + (i + 1) + " (" + apiKeyToUse.substring(0, 4) + "...):\n    " + result.message.replace(/\n/g, '\n    '));
        if (i < keysToTry.length - 1) {
            try { sleep(100); } catch (e) {}
        }
    }
    return { 
        status: 'all_keys_failed', 
        message: 'Tất cả API keys đều thất bại cho chunk này.',
        details: keyErrors 
    }; 
}

function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    var combinedApiKeys = [].concat(apiKeys); 
    try {
        var localKeysString = cacheStorage.getItem('vp_key_list');
        if (localKeysString) {
            var localKeys = localKeysString.split('\n')
                .map(function(key) { return key.trim(); })
                .filter(function(key) { return key; }); 
            if (localKeys.length > 0) {
                combinedApiKeys = combinedApiKeys.concat(localKeys);
            }
        }
    } catch (e) {}
    var uniqueKeys = [];
    var seenKeys = {};
    for (var i = 0; i < combinedApiKeys.length; i++) {
        if (!seenKeys[combinedApiKeys[i]]) {
            seenKeys[combinedApiKeys[i]] = true;
            uniqueKeys.push(combinedApiKeys[i]);
        }
    }
    combinedApiKeys = uniqueKeys;

    var apiKeyStorageKey = "vbook_last_api_key_index";
    var rotatedApiKeys = combinedApiKeys; 
    try {
        if (combinedApiKeys && combinedApiKeys.length > 1) {
            var lastUsedIndex = parseInt(cacheStorage.getItem(apiKeyStorageKey) || "-1");
            var nextIndex = (lastUsedIndex + 1) % combinedApiKeys.length;
            rotatedApiKeys = combinedApiKeys.slice(nextIndex).concat(combinedApiKeys.slice(0, nextIndex));
            cacheStorage.setItem(apiKeyStorageKey, nextIndex.toString());
        }
    } catch (e) {
        rotatedApiKeys = combinedApiKeys;
    }

    var lines = text.split('\n');
    
    if (to === 'vi_xoacache') {
        var isChapterContentForDelete = text.length >= 800;
        if (isChapterContentForDelete) {
            var shortLinesCountForDelete = 0;
            if (lines.length > 0) {
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].length < 25) {
                        shortLinesCountForDelete++;
                    }
                }
                if ((shortLinesCountForDelete / lines.length) > 0.8) {
                    isChapterContentForDelete = false;
                }
            }
        }

        if (isChapterContentForDelete) {
            var cacheKeyToDelete = generateFingerprintCacheKey(lines);
            if (cacheStorage.getItem(cacheKeyToDelete) !== null) {
                cacheStorage.removeItem(cacheKeyToDelete);
                return Response.success("Đã xóa cache của chương này thành công.\n\n" + text);
            }
        }
        
        return Response.success(text); 
    }

    var isShortTextOrList = false;
    var lengthThreshold = 1000;   
    var lineLengthThreshold = 25; 
    if (to === 'vi_vietlai') {
        lengthThreshold = 1500;
        lineLengthThreshold = 80;
    }
    if (text.length < lengthThreshold) {
        isShortTextOrList = true;
    } else {
        var shortLinesCount = 0;
        var totalLines = lines.length;
        if (totalLines > 0) {
            for (var i = 0; i < totalLines; i++) {
                if (lines[i].length < lineLengthThreshold) { shortLinesCount++; }
            }
            if ((shortLinesCount / totalLines) > 0.7) {
                isShortTextOrList = true;
            }
        }
    }
    if (to === 'vi_vietlai' && isShortTextOrList) {
        return Response.success(text);
    }

    var finalContent = "";
    var useGeminiForShortText = false;
    
    if (isShortTextOrList) {
        var basicLangs = ['zh', 'en', 'vi', 'auto'];
        if (basicLangs.indexOf(from) > -1 && basicLangs.indexOf(to) > -1) {
            useGeminiForShortText = true;
        }
    }

    if (isShortTextOrList && !useGeminiForShortText) {
        const BAIDU_CHUNK_SIZE = 300;
        var baiduTranslatedParts = [];
        var basicBaiduLangs = ['vi', 'zh', 'en'];
        var baiduToLang = basicBaiduLangs.indexOf(to) > -1 ? to : 'vi';

        for (var i = 0; i < lines.length; i += BAIDU_CHUNK_SIZE) {
            var currentChunkLines = lines.slice(i, i + BAIDU_CHUNK_SIZE);
            var chunkText = currentChunkLines.join('\n');
            var translatedChunk = baiduTranslateContent(chunkText, 'auto', baiduToLang, 0); 
            if (translatedChunk === null) {
                return Response.error("Lỗi Baidu Translate. Vui lòng thử lại.");
            }
            baiduTranslatedParts.push(translatedChunk);
        }
        finalContent = baiduTranslatedParts.join('\n');
    } else {
        if (!rotatedApiKeys || rotatedApiKeys.length === 0) { return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key."); }
        
        var cacheKey = null;
        if (!isShortTextOrList) {
             try {
                cacheKey = generateFingerprintCacheKey(lines);
                var cachedTranslation = cacheStorage.getItem(cacheKey);
                if (cachedTranslation) {
                    return Response.success(cachedTranslation);
                }
            } catch (e) {
                cacheKey = null;
            }
        }
        
        var modelToUse = null;
        var useModelLoop = true;
        var finalTo = to; 
        var isPinyinRoute = false; 
        var validModels = ["gemini-2.5-pro", "gemini-2.5-flash-preview-05-20", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
        var pinyinLangs = ['vi_tieuchuan', 'vi_sac', 'vi_NameEng', 'vi_layname', 'vi_tuychon1', 'vi_tuychon2'];

        if (validModels.indexOf(from) > -1) {
            modelToUse = from;
            useModelLoop = false;
            if (pinyinLangs.indexOf(to) > -1) isPinyinRoute = true;
        } else if (from === 'en' || from === 'vi') {
            var validTargets = ['zh', 'vi', 'en'];
            if (validTargets.indexOf(finalTo) === -1) finalTo = 'vi';
            isPinyinRoute = false; 
        } else {
            if (pinyinLangs.indexOf(to) > -1) isPinyinRoute = true;
        }

        var selectedPrompt = prompts[finalTo] || prompts["vi"];
        
        var translationSuccessful = false;
        var errorLog = {};
        var modelsToIterate = useModelLoop ? models : [modelToUse];

        for (var m = 0; m < modelsToIterate.length; m++) {
            var currentModel = modelsToIterate[m];
            var CHUNK_SIZE = 4000;
            var MIN_LAST_CHUNK_SIZE = 500;
            if (currentModel === "gemini-2.5-pro") {
                CHUNK_SIZE = 1500; MIN_LAST_CHUNK_SIZE = 100;
            } else if (currentModel === "gemini-2.5-flash" || currentModel === "gemini-2.5-flash-preview-05-20") {
                CHUNK_SIZE = 2000; MIN_LAST_CHUNK_SIZE = 500;
            }
// || currentModel === "gemini-2.0-flash-lite" || currentModel === "gemini-2.0-flash"
            var textChunks = [];
            var currentChunk = "";
            var currentChunkLineCount = 0;
            const MAX_LINES_PER_CHUNK = 50;
            for (var i = 0; i < lines.length; i++) {
                var paragraph = lines[i];
                if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
                    textChunks.push(paragraph);
                    continue;
                }
                if ((currentChunk.length + paragraph.length + 1 > CHUNK_SIZE || currentChunkLineCount >= MAX_LINES_PER_CHUNK) && currentChunk.length > 0 ) {
                    textChunks.push(currentChunk);
                    currentChunk = paragraph;
                    currentChunkLineCount = 1;
                } else {
                    currentChunk = currentChunk ? (currentChunk + "\n" + paragraph) : paragraph;
                    currentChunkLineCount++;
                }
            }
            if (currentChunk.length > 0) textChunks.push(currentChunk);
            if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
                var lastChunk = textChunks.pop();
                var secondLastChunk = textChunks.pop();
                textChunks.push(secondLastChunk + "\n" + lastChunk);
            }

            var finalParts = [];
            var currentModelFailed = false;
            for (var k = 0; k < textChunks.length; k++) {
                var chunkToSend = textChunks[k];
                if (isPinyinRoute && !isShortTextOrList) {
                    try {
                        load("phienam.js");
                        chunkToSend = phienAmToHanViet(chunkToSend);
                    } catch (e) { return Response.error("LỖI: Không thể tải file phienam.js."); }
                }
                var chunkResult = translateChunkWithApiRetry(chunkToSend, selectedPrompt, currentModel, rotatedApiKeys);
                if (chunkResult.status === 'success') {
                    finalParts.push(chunkResult.data);
                } else {
                    errorLog[currentModel] = chunkResult.details;
                    currentModelFailed = true;
                    break; 
                }
            }
            if (!currentModelFailed) {
                finalContent = modelsucess + " . " + finalParts.join('\n\n');
                translationSuccessful = true;
                break; 
            }
        } 

        if (!translationSuccessful) {
            var errorString = "<<<<<--- LỖI DỊCH --->>>>>\n";
            for (var modelName in errorLog) {
                errorString += "\n--- Lỗi với Model: " + modelName + " ---\n";
                if(errorLog[modelName]) errorString += errorLog[modelName].join("\n");
            }
            return Response.error(errorString);
        }
    }

    if (cacheKey && finalContent && !finalContent.includes("LỖI DỊCH")) {
        if (cacheableModels.indexOf(modelsucess.trim()) > -1 && to !== 'vi_layname') {
            try {
                cacheStorage.setItem(cacheKey, finalContent.trim());
            } catch (e) {}
        }
    }
    
    return Response.success(prompts[to] + finalContent);
}