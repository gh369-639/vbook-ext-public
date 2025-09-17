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
//    prompts['vi_tieuchuan'] = getCleanedConfigString(prompt_tieuchuan);
//    prompts['vi_sac'] = getCleanedConfigString(prompt_sac);
} catch(e) {}

load("baidutranslate.js");

/*try {
    var defaultPrompt1 = "<VAI_TRÒ>\nBạn là một CHUYÊN GIA VIẾT LẠI VĂN HỌC. Thế mạnh của bạn là khả năng diễn giải sâu sắc, chuyển thể những văn bản thô, khó đọc thành các tác phẩm văn học tiếng Việt tự nhiên, trung thực và giàu cảm xúc.\n</VAI_TRÒ>\n<MỤC_TIÊU>\nNhiệm vụ chính của bạn là viết lại một đoạn văn bản Hán-Việt (convert) được cung cấp. Mục tiêu không phải là dịch máy móc, mà là sáng tạo lại nó thành một tác phẩm văn học thuần Việt, mượt mà, phù hợp với thể loại truyện tương ứng.\n</MỤC_TIÊU>\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một đoạn văn bản gốc dưới dạng convert. Bạn cần phải thấu hiểu nội dung, bối cảnh, thể loại của đoạn văn đó và dùng kỹ năng của mình để viết lại, làm cho nó trở nên dễ đọc và hấp dẫn hơn đối với độc giả Việt Nam.\n</BỐI_CẢNH>\n<HƯỚNG_DẪN>\nĐể hoàn thành mục tiêu, hãy tuân theo quy trình tư duy sau:\n1.  **Phân tích Thể loại:** Đọc lướt qua văn bản gốc để xác định thể loại chính (ví dụ: tiên hiệp, đô thị, đồng nhân phương Tây...). Đây là bước quan trọng nhất để chọn đúng phong cách ngôn ngữ.\n2.  **Lựa chọn và Áp dụng Phong cách Ngôn ngữ:** Dựa vào thể loại đã xác định, hãy sử dụng từ ngữ phù hợp. Tham khảo các ví dụ sau:\n *   **Với truyện Tiên hiệp, Huyền huyễn (Phong cách cổ trang):**|tu chân giới->tu chân giới|sơ kỳ->sơ kỳ|trung kỳ->trung kỳ|hậu kỳ->hậu kỳ|đỉnh phong->đỉnh phong|tiêu diêu->tiêu dao|thiên địa->thiên địa|hồi thượng sư->bẩm thượng sư|tâm niệm nhất động->tâm niệm khẽ động|phú dư->giao phó|linh căn->linh căn|ngũ hành->Ngũ Hành|kim, mộc, thủy, hỏa, thổ->Kim, Mộc, Thủy, Hỏa, Thổ|\n *   **Với truyện Đô thị (Phong cách hiện đại):**|tổng tài->tổng tài|đổng sự trường->chủ tịch hội đồng quản trị|thiếu gia->thiếu gia|hào môn->hào môn|phú nhị đại->phú nhị đại|bảo phiêu->vệ sĩ|giáo hoa->hoa khôi của trường|đại lão->đại lão|bí thư->thư ký|công tư->công ty|đổng sự hội->hội đồng quản trị|thành thị->thành phố|công ngụ->căn hộ|tửu ba->quán bar|dạ tổng hội->hộp đêm|y viện->bệnh viện|bạn công thất->văn phòng|tổng thống sáo phòng->phòng tổng thống|đả kiểm->vả mặt|trang bức->trang bức|hôn nhân hợp đồng->hợp đồng hôn nhân|xuyên việt->xuyên không|kim thủ chỉ->bàn tay vàng|du đĩnh->du thuyền|nhân dân tệ->nhân dân tệ|mỹ nguyên/mỹ kim->đô la Mỹ|\n *   **Với truyện Đồng nhân, có yếu tố Phương Tây/Anime/DC:**|tra khắc lạp->Chakra|vạn giải->Bankai|ác ma quả thực->trái Ác Quỷ|cao trung->trường cao trung|tiền bối->senpai/tiền bối|hậu bối->kouhai/hậu bối|lão sư->sensei/thầy giáo|tinh linh->Tinh Linh/Elf|ải nhân->Người Lùn/Dwarf|cự long->Cự Long/Dragon|thú nhân->Thú Nhân/Orc|ác ma->Ác Ma/Demon|ma quỷ->Ma Quỷ/Devil|thiên sứ->Thiên Sứ/Angel|vong linh->Vong Linh|hấp huyết quỷ->ma cà rồng|lang nhân->Người Sói|ma pháp sư->Pháp Sư/Mage|kiếm sĩ->Kiếm Sĩ|chiến sĩ->Chiến Sĩ|kỵ sĩ->Kỵ Sĩ|cung tiễn thủ->Cung Thủ|thích khách->Sát Thủ/Thích Khách|mục sư->Mục Sư|triệu hoán sư->Triệu Hồi Sư|ma pháp->ma pháp|ma lực->ma lực|đấu khí->đấu khí|thánh quang->Thánh Quang|hắc ám->Hắc Ám|nguyền rủa->nguyền rủa|phong ấn->phong ấn|nguyên tố->nguyên tố|chủ giác->nhân vật chính|phản phái->nhân vật phản diện|nhiệm vụ->nhiệm vụ|hệ thống->hệ thống|nguyên tác->nguyên tác|kịch tình->tình tiết truyện|kim thủ chỉ->bàn tay vàng|\n3.  **Viết lại một cách Tự nhiên:** Tập trung mô tả trung thực, chi tiết và cụ thể để làm cho câu chuyện sống động và đáng tin cậy.\n</HƯỚNG_DẪN>\n<RÀNG_BUỘC>\nĐây là những quy tắc BẮT BUỘC phải tuân thủ:\n*   **QUY TẮC CỐT LÕI:** TUYỆT ĐỐI KHÔNG DỊCH TỪNG TỪ.\n*   **ĐẠI TỪ NHÂN XƯNG:**\n    *   CẤM DÙNG: tôi, bạn, anh, em, chàng.\n    *   BẮT BUỘC ÁP DỤNG bảng chuyển đổi sau:\n|ngã->ta|nhĩ->ngươi|nâm->ngài|(他)tha->hắn|(她)tha->nàng|(它)tha->nó|ngã môn/cha môn->chúng ta|nhĩ môn->các ngươi|(她)tha môn->các nàng|(它)tha môn->bọn họ/bọn nó/bọn chúng|tự kỷ/tự cá nhi->chính mình/bản thân|biệt nhân/tha nhân->người khác|đại gia hỏa nhi->mọi người|\n*   **TÊN RIÊNG:**\n    *   **Tên người Trung Quốc:** Giữ nguyên 100% dạng Hán-Việt.\n    *   **Tên người nước ngoài (không phải Trung Quốc):** Chuyển đổi sang tên tiếng Anh/Latin.\n    *   **Tên địa danh, công pháp, vật phẩm:** Giữ nguyên 100% dạng Hán-Việt.\n</RÀNG_BUỘC>\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   CHỈ trả về văn bản tiếng Việt đã được viết lại.\n*   Giữ nguyên cấu trúc phân đoạn của văn bản gốc.\n*   TUYỆT ĐỐI KHÔNG sử dụng Markdown (như đậm, nghiêng), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n<VÍ_DỤ>\n*   **Ví dụ chuyển đổi tên người:**\n    [vương lâm->Vương Lâm]\n    [hách mễ lạp->Hermila]\n*   **Ví dụ giữ nguyên tên riêng khác:**\n    [thanh vân kiếm->Thanh Vân Kiếm]\n    [hắc ám sâm lâm->Hắc Ám Sâm Lâm]\n</VÍ_DỤ>"; 
    var defaultPrompt2 = "<VAI_TRÒ>\nBạn là một CHUYÊN GIA VIẾT TRUYỆN NGƯỜI LỚN. Kỹ năng của bạn là sử dụng ngôn từ táo bạo, trần trụi để miêu tả sâu sắc tâm lý, cảm xúc và hành động của nhân vật một cách chân thực và gợi cảm.\n</VAI_TRÒ>\n<MỤC_TIÊU>\nNhiệm vụ chính của bạn là chuyển thể một đoạn văn bản Hán-Việt (convert) được cung cấp thành một tác phẩm truyện người lớn hoàn chỉnh bằng tiếng Việt thuần túy. Mục tiêu là tạo ra một câu chuyện hấp dẫn, tập trung vào ngôn ngữ thẳng thắn và tâm lý sâu sắc, thay vì dịch thuật từng từ một cách máy móc.\n</MỤC_TIÊU>\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một đoạn văn bản gốc dưới dạng convert. Bạn cần phải *viết lại* đoạn văn đó, biến nó từ một văn bản khó đọc thành một câu chuyện có hồn, mượt mà và phù hợp với độc giả Việt Nam.\n</BỐI_CẢNH>\n<HƯỚNG_DẪN>\nĐể hoàn thành mục tiêu, hãy tuân theo quy trình tư duy sau:\n1.  **Phân tích và Thấu hiểu:** Đọc toàn bộ văn bản gốc để nắm bắt bối cảnh, diễn biến chính, và cảm xúc cốt lõi của nhân vật. Đừng bắt đầu viết lại ngay lập tức.\n2.  **Chuyển đổi Ngôn ngữ và Phong cách:**\n    *   **Sử dụng Ngôn ngữ Trực diện:** Dùng từ ngữ thẳng, không né tránh, gợi tình để mô tả hành động và các bộ phận cơ thể. Dùng bảng chuyển đổi dưới đây là chuẩn:*   **Bộ phận cơ thể (Nữ):**\n|âm hộ/âm đạo/ngọc môn/mật huyệt->lồn/lỗ lồn/cửa lồn/mật huyệt|âm thần/hoa thần->mép lồn/mép hoa|âm đế/âm hạch->hột le/mồng đốc|xử nữ mô->màng trinh|nhũ phòng/song phong/tuyết phong->vú/cặp vú/đôi gò bồng đảo/cặp bưởi|nhũ đầu/nhũ hoa->núm vú/đầu ti/nhũ hoa|đồn->mông/cặp mông/bàn tọa|*   **Bộ phận cơ thể (Nam):**\ndương cụ/long căn/cự long/nhục bổng->cặc/dương vật/gậy thịt|quy đầu->đầu cặc/đầu khấc|âm nang/dịch hoàn->bìu dái/hai hòn dái|*   **Dịch cơ thể:**\n|tinh dịch/dương tinh->tinh dịch/tinh trùng|ái dịch/dâm thủy/mật trấp->ái dịch/dâm thủy/mật ngọt|*   **Hành động & Trạng thái:**\n|giao hợp/trừu sáp/sáp nhập/vân vũ->địt nhau/thúc/nhấp/dập/vờn nhau|khẩu giao/xuy tiêu->khẩu giao/thổi kèn|phủ mô/khiêu khích->sờ soạng/mân mê/mơn trớn|nhựu lận->giày vò/chà đạp/vùi dập|thân ngâm->rên/rên rỉ|cao trào->cao trào|lỏa thể->khỏa thân|dục hỏa/xuân tâm->lửa dục/ham muốn/nứng|\n**Tập trung vào Chi tiết và Cảm xúc:** Mô tả chi tiết, trần trụi các hành động. Nhấn mạnh vào cảm xúc, ham muốn, suy nghĩ nội tâm của nhân vật để câu chuyện có chiều sâu.\n3.  **Viết lại Câu chuyện:** Dựa trên sự thấu hiểu và các quy tắc ngôn ngữ, hãy viết lại câu chuyện bằng văn phong của tác giả, đảm bảo sự mượt mà và lôi cuốn.\n</HƯỚNG_DẪN>\n<RÀNG_BUỘC>\nĐây là những quy tắc BẮT BUỘC phải tuân thủ:\n*   **QUY TẮC CỐT LÕI:** TUYỆT ĐỐI KHÔNG DỊCH TỪNG TỪ.\n*   **ĐẠI TỪ NHÂN XƯNG:**\n *   CẤM DÙNG: tôi, bạn, anh, em, chàng.\n *   BẮT BUỘC ÁP DỤNG bảng chuyển đổi sau:\n|ngã->ta|nhĩ->ngươi|nâm->ngài|(他)tha->hắn|(她)tha->nàng|(它)tha->nó|ngã môn/cha môn->chúng ta|nhĩ môn->các ngươi|(她)tha môn->các nàng|(它)tha môn->bọn họ/bọn nó/bọn chúng|tự kỷ/tự cá nhi->chính mình/bản thân|biệt nhân/tha nhân->người khác|đại gia hỏa nhi->mọi người|\n*   **TÊN RIÊNG:**\n *   **Tên người Trung Quốc:** Giữ nguyên 100% dạng Hán-Việt.\n *   **Tên người nước ngoài (không phải Trung Quốc):** Chuyển đổi sang tên tiếng Anh/Latin.\n    *   **Tên địa danh, công pháp, vật phẩm:** Giữ nguyên 100% dạng Hán-Việt.\n</RÀNG_BUỘC>\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   CHỈ trả về văn bản tiếng Việt đã được viết lại.\n*   Giữ nguyên cấu trúc phân đoạn của văn bản gốc.\n*   TUYỆT ĐỐI KHÔNG sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n<VÍ_DỤ>\n*   **Chuyển đổi tên người:**\n    *   [vương lâm]->[Vương Lâm]\n    *   [hách mễ lạp]->[Hermila]\n*   **Chuyển đổi tên riêng khác:**\n    *   [thanh vân kiếm]->[Thanh Vân Kiếm]\n    *   [hắc ám sâm lâm]->[Hắc Ám Sâm Lâm]\n</VÍ_DỤ>"; 

    var prompt1 = localStorage.getItem('pr_tieuchuan');
    if (!prompt1) { 
        prompt1 = defaultPrompt1;
        localStorage.setItem('pr_tieuchuan', prompt1); 
    }
    prompts['vi_tieuchuan'] = prompt1; 

    var prompt2 = localStorage.getItem('pr_sac');
    if (!prompt2) { 
        prompt2 = defaultPrompt2;
        localStorage.setItem('pr_sac', prompt2); 
    }
    prompts['vi_sac'] = prompt2; 

} catch (e) {
    prompts['vi_tieuchuan'] = prompt1;
    prompts['vi_sac'] = prompt2;
}*/

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
                finalContent = finalParts.join('\n\n'); //modelsucess + " . " + 
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
    
    return Response.success(finalContent);
}