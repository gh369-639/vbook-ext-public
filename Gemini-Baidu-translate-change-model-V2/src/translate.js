load("language_list.js"); 
// xử lý apikey
var apiKeys = [];
try {
    if (typeof api_keys !== 'undefined' && api_keys) {
        let clean_api_keys = api_keys;
        clean_api_keys = clean_api_keys.replace(/^"([\s\S]*)"$/, "$1");
        apiKeys = (clean_api_keys || "").split('\n') 
            .map(function(k) { return k.trim(); })
            .filter(function(k) { return k !== ""; });
    }
} catch (e) {}
//xử lý model lưu chương
var cacheableModels = [];
try {
    if (typeof modelsavecache !== 'undefined' && modelsavecache) {
        let clean_modelsavecache = modelsavecache;
        clean_modelsavecache = clean_modelsavecache.replace(/^"([\s\S]*)"$/, "$1");
        cacheableModels = (clean_modelsavecache || "").split('\n')
            .map(function(k) { return k.trim(); })
            .filter(function(k) { return k !== ""; });
    }
} catch (e) {}

load("prompt.js");

load("baidutranslate.js");

let modelsucess = "";
let models = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-flash-lite"
];

function generateFingerprintCacheKey(lines) {
    let keyParts = "";
    let linesForId = lines.slice(0, 5); 
    for (let i = 0; i < linesForId.length; i++) {
        let line = linesForId[i].trim();
        if (line.length >= 6) { 
            keyParts += line.substring(0, 3) + line.slice(-3);
        } else {
            keyParts += line;
        }
    }
    return "vbook_fp_cache_" + keyParts;
}

// hàm gọi api
function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    modelsucess = model;
    let maxop = 65536;
    if (model === "gemini-2.0-flash-exp" || model === "gemini-2.0-flash-thinking-exp-01-21" || model === "gemini-2.0-flash-lite-001" || model === "gemini-2.0-flash-001" ) maxop = 8192
    let full_prompt = prompt + "\n\nDưới đây là văn bản cần xử lý\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "role": "user", "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": parseFloat(temp), "topP": parseFloat(topP), "topK": parseFloat(topK), "maxOutputTokens":parseInt(maxop) },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };
    try {
        let response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

        if (response.ok) {
            let result = response.json();
            if (result.candidates && result.candidates.length > 0) {
                let candidate = result.candidates[0];
                if (candidate.finishReason === "MAX_TOKENS") {
                    return { status: "error", message: "Dịch bị cắt ngắn do đạt giới hạn token (MAX_TOKENS)." };
                }
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
                    let textResult = candidate.content.parts[0].text.trim();
                    return { status: "success", data: textResult };
                }
            }
            if (result.promptFeedback && result.promptFeedback.blockReason) { return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason }; }
            if (result.candidates && result.candidates.length > 0 && (!result.candidates[0].content || !result.candidates[0].content.parts)) { return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." }; }
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + ". Phản hồi từ server:\n" };
        }
    } catch (e) { return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() }; }
}
// hàm quản lý gọi api
function translateChunkWithApiRetry(chunkText, prompt, modelToUse, keysToTry, from, to) { 
    let keyErrors = [];
    for (let i = 0; i < keysToTry.length; i++) {
        let apiKeyToUse = keysToTry[i];
        let result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);
        
        if (result.status === "success") {
            const hanTuRegex = /[\u4e00-\u9fff]/;
            if (hanTuRegex.test(result.data)) {
                let chunklines = result.data.split('\n');
                let processedLines = [];

                for (let i = 0; i < chunklines.length; i++) {
                    let chunkline = chunklines[i];
                    if (hanTuRegex.test(chunkline)) {
                        let reTransChunkLine = callGeminiAPI(chunkline, prompt, apiKeyToUse, modelToUse);
                        if (reTransChunkLine.status === 'success' && !hanTuRegex.test(reTransChunkLine.data)) {
                            processedLines.push(reTransChunkLine.data);
                        } else {
                            processedLines.push(chunkline);
                        }
                    } else {
                        processedLines.push(chunkline);
                    }
                }
                result.data = processedLines.join('\n');
            }

            if ((result.data.length / chunkText.length) < 0.5) {
                result.status = "short_result_error";
                result.message = "Kết quả trả về ngắn hơn 50% so với văn bản gốc.";
            }

            if (result.status === "success") {
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
// xử lý prompt
    try {
        const defaultPrompt2 = "<VAI_TRÒ>\nBạn là một **CHUYÊN GIA VIẾT TRUYỆN NGƯỜI LỚN**. Kỹ năng của bạn là sử dụng ngôn từ *táo bạo, trần trụi* để miêu tả *sâu sắc* tâm lý, cảm xúc và hành động của nhân vật một cách chân thực và gợi cảm.\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\n*Nhiệm vụ* chính của bạn là chuyển thể một văn bản được cung cấp thành một tác phẩm truyện người lớn *hoàn chỉnh bằng tiếng Việt thuần túy*. *Mục tiêu* là tạo ra một câu chuyện hấp dẫn, tập trung vào ngôn ngữ thẳng thắn và tâm lý sâu sắc, **thay vì dịch thuật từng từ một cách máy móc**.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một văn bản gốc dưới dạng Hán-Việt hỗn hợp. Bạn cần phải *viết lại* đoạn văn đó, biến nó thành một câu chuyện có hồn, mượt mà và phù hợp với độc giả Việt Nam.\n</BỐI_CẢNH>\n\n<HƯỚNG_DẪN>\nĐể hoàn thành mục tiêu, hãy tuân theo quy trình tư duy 3 bước sau:\n\n1.  **Phân tích và Thấu hiểu:** Đọc toàn bộ văn bản gốc để nắm bắt bối cảnh, diễn biến chính, và cảm xúc cốt lõi của nhân vật. Đừng bắt đầu viết lại ngay lập tức.\n\n2.  **Chuyển đổi Ngôn ngữ và Phong cách:**\n    *   ***Sử dụng Ngôn ngữ Trực diện:*** Dùng từ ngữ thẳng, không né tránh.\n\n    *   ***Tập trung vào Chi tiết và Cảm xúc:*** Mô tả chi tiết, trần trụi các hành động. Nhấn mạnh vào *cảm xúc, ham muốn, suy nghĩ nội tâm* của nhân vật để câu chuyện có chiều sâu.\n\n3.  **Viết lại Câu chuyện:** Dựa trên sự thấu hiểu và các quy tắc ngôn ngữ, hãy viết lại câu chuyện bằng *văn phong của văn bản gốc*, đảm bảo sự mượt mà và lôi cuốn.\n</HƯỚNG_DẪN>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **QUY TẮC CỐT LÕI:** **DỊCH Ý KHÔNG DỊCH WORD-BY-WORD.**\n\n2.  **ĐẠI TỪ NHÂN XƯNG:**\n    *   **CẤM DÙNG:** *tôi, bạn, anh, em, chàng.*\n\n3.  **TÊN RIÊNG:**\n    *   **Tên người Trung Quốc:** **Giữ nguyên 100%**.\n    *   **Tên người nước ngoài (không phải Trung Quốc):** **Chuyển đổi** sang tên tiếng Anh/Latin.\n    *   **Tên địa danh, công pháp, vật phẩm:** **Chuẩn hóa theo thể loại truyện**.\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   100% Việt hóa: Sử dụng (/[\u4e00-\u9fff]/.test) để kiểm tra, loại bỏ pinyin/ký tự Trung.\n*  Tôn trọng nguyên tác: Không thay đổi tình tiết, tính cách, logic.\n*  Kiểm tra chất lượng:\n   Nhất quán: Tên nhân vật, xưng hô không thay đổi trong văn bản.\n   Tự động kiểm tra: Scan lỗi pinyin (VD: 'nihao'), ký tự Trung (VD: 你好), thuật ngữ thô (VD: 'liền tựu thị').\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n1.  **Ví dụ chuyển đổi tên người:**\n    | Tên gốc (Hán-Việt) | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | vương lâm | Vương Lâm |\n    | hách mễ lạp | Hermila |\n\n2.  **Ví dụ giữ nguyên tên riêng khác:**\n    | Tên gốc | Tên kết quả (Mục Tiêu) |\n    |---|---|\n    | thanh vân kiếm | Thanh Vân Kiếm |\n    | hắc ám sâm lâm | Hắc Ám Sâm Lâm |\n</VÍ_DỤ>";
        const defaultPrompt1 = "<VAI_TRÒ>\nBạn là một **CHUYÊN GIA VIẾT LẠI VĂN HỌC**. Thế mạnh của bạn là khả năng *diễn giải sâu sắc*, chuyển thể những văn bản gốc thành các tác phẩm văn học tiếng Việt *tự nhiên, trung thực và giàu cảm xúc*.\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\nNhiệm vụ chính của bạn là viết lại văn bản được cung cấp. Mục tiêu không phải là dịch máy móc, mà là **sáng tạo lại nó** thành một tác phẩm văn học thuần Việt, mượt mà, *phù hợp với thể loại truyện tương ứng*.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một văn bản gốc dưới dạng Hán-Việt hỗn hợp. Bạn cần phải thấu hiểu nội dung, bối cảnh, và thể loại của đoạn văn đó để *viết lại*, làm cho nó trở nên dễ đọc và hấp dẫn hơn đối với độc giả Việt Nam.\n</BỐI_CẢNH>\n\n<HƯỚNG_DẪN>\nĐể hoàn thành mục tiêu, hãy tuân theo quy trình tư duy 3 bước sau:\n\n1.  **Phân tích Thể loại:** Đọc lướt qua văn bản gốc để **xác định thể loại chính** (ví dụ: tiên hiệp, đô thị, đồng nhân...). Đây là bước quan trọng nhất để chọn đúng phong cách ngôn ngữ.\n\n2.  **Lựa chọn và Áp dụng Phong cách Ngôn ngữ:** Dựa vào thể loại đã xác định, hãy sử dụng từ ngữ phù hợp. Tham khảo các bảng hướng dẫn dưới đây:\n\n    *   ***Với truyện Tiên hiệp, Huyền huyễn: Phong cách cổ trang.***\n\n    *   ***Với truyện Đô thị: Phong cách hiện đại.***\n\n    *   ***Với truyện Đồng nhân, có yếu tố Phương Tây/Anime/DC: Chuẩn hóa danh từ phù hợp với thể loại.***\n\n3.  **Viết lại một cách Tự nhiên:** Tập trung mô tả trung thực, chi tiết và cụ thể để làm cho câu chuyện sống động và đáng tin cậy.\n</HƯỚNG_DẪN>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **QUY TẮC CỐT LÕI:** **DỊCH Ý KHÔNG DỊCH WORD-BY-WORD.**\n\n2.  **ĐẠI TỪ NHÂN XƯNG:**\n    *   **CẤM DÙNG:** *tôi, bạn, anh, em, chàng.*\n\n3.  **TÊN RIÊNG:**\n    *   **Tên người Trung Quốc:** **Giữ nguyên 100%**.\n    *   **Tên người nước ngoài (không phải Trung Quốc):** **Chuyển đổi** sang tên tiếng Anh/Latin.\n    *   **Tên địa danh, công pháp, vật phẩm:** **Chuẩn hóa theo thể loại truyện**.\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   100% Việt hóa: Sử dụng (/[\u4e00-\u9fff]/.test) để kiểm tra, loại bỏ pinyin/ký tự Trung.\n*  Tôn trọng nguyên tác: Không thay đổi tình tiết, tính cách, logic.\n*  Kiểm tra chất lượng:\n   Nhất quán: Tên nhân vật, xưng hô không thay đổi trong văn bản.\n   Tự động kiểm tra: Scan lỗi pinyin (VD: 'nihao'), ký tự Trung (VD: 你好), thuật ngữ thô (VD: 'liền tựu thị').\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n1.  **Ví dụ chuyển đổi tên người:**\n    | Tên gốc | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | vương lâm | Vương Lâm |\n    | hách mễ lạp | Hermila |\n\n2.  **Ví dụ giữ nguyên tên riêng khác:**\n    | Tên gốc (Hán-Việt) | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | thanh vân kiếm | Thanh Vân Kiếm |\n    | hắc ám sâm lâm | Hắc Ám Sâm Lâm |\n</VÍ_DỤ>";
        const defaultPrompt3 = "<VAI_TRÒ>\nBạn là một **BIÊN TẬP VIÊN CHUYÊN NGHIỆP**. Nhiệm vụ của bạn là mài giũa một văn bản thô thành một tác phẩm hoàn chỉnh, mượt mà và dễ đọc.\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\nBiên tập lại văn bản *convert* thô được cung cấp thành một tác phẩm tiếng Việt *mượt mà, tự nhiên và trôi chảy*. Mục tiêu chính là loại bỏ sự lủng củng, khó hiểu của văn bản gốc.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một văn bản convert. Bạn cần đóng vai trò là người biên tập cuối cùng, chỉ tập trung vào việc làm cho câu chữ hay hơn mà không thay đổi nội dung gốc.\n</BỐI_CẢNH>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **LÀM MƯỢT CÂU VĂN:**\n    *   Viết lại các câu lủng củng, tối nghĩa, sai ngữ pháp.\n    *   Sắp xếp lại trật tự từ để câu văn nghe tự nhiên hơn theo văn phong tiếng Việt.\n\n2.  **VIỆT HÓA TỪ NGỮ:**\n    *   Chủ động thay thế các từ Hán-Việt không thông dụng hoặc không cần thiết bằng các từ thuần Việt tương đương.\n    *   *Ví dụ:* `thân hình hóa tác nhất đạo lưu quang` -> `thân hình hóa thành một vệt sáng`.\n\n3.  **TUYỆT ĐỐI BẢO TOÀN NỘI DUNG:**\n    *   **KHÔNG** thêm, bớt hay thay đổi cốt truyện, tình tiết, hành động.\n    *   **GIỮ NGUYÊN 100% TẤT CẢ TÊN RIÊNG** (nhân vật, địa danh, công pháp, vật phẩm...).\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   100% Việt hóa: Sử dụng (/[\u4e00-\u9fff]/.test) để kiểm tra, loại bỏ pinyin/ký tự Trung.\n*  Tôn trọng nguyên tác: Không thay đổi tình tiết, tính cách, logic.\n*  Kiểm tra chất lượng:\n   Nhất quán: Tên nhân vật, xưng hô không thay đổi trong văn bản.\n   Tự động kiểm tra: Scan lỗi pinyin (VD: 'nihao'), ký tự Trung (VD: 你好), thuật ngữ thô (VD: 'liền tựu thị').\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n*   **Văn bản gốc (Convert):**\n    `Ngã tâm niệm nhất động, thân hình hóa tác nhất đạo lưu quang, hướng về viễn phương bạo xạ nhi khứ.`\n*   **Kết quả mong muốn (Đã biên tập):**\n    `Tâm niệm hắn khẽ động, thân hình hóa thành một vệt sáng, lao vút về phía xa.`\n</VÍ_DỤ>";

        for (let i = 0; i < languages.length; i++) {
            let langId = languages[i].id;

            if (langId && langId.includes("PROMPT_")) {
                
                let existingPrompt = localStorage.getItem(langId);

                if (!existingPrompt) {
                    if (langId === 'PROMPT_tieuchuan') {
                        localStorage.setItem(langId, defaultPrompt1);
                    } else if (langId === 'PROMPT_sac') {
                        localStorage.setItem(langId, defaultPrompt2);
                    } else if (langId === 'PROMPT_vietlai') {
                        localStorage.setItem(langId, defaultPrompt3);
                    } else if (langId === 'PROMPT_xoacache') {
                        continue;
                    }
                    else localStorage.setItem(langId, "<VAI_TRÒ>\n</VAI_TRÒ>\n<MỤC_TIÊU>\nDịch sang Tiếng Việt\n</MỤC_TIÊU>\n<BỐI_CẢNH>\n</BỐI_CẢNH>\n<HƯỚNG_DẪN>\n</HƯỚNG_DẪN>\n<RÀNG_BUỘC>\n</RÀNG_BUỘC>\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   100% Việt hóa: Sử dụng (/[\u4e00-\u9fff]/.test) để kiểm tra, loại bỏ pinyin/ký tự Trung.\n*  Tôn trọng nguyên tác: Không thay đổi tình tiết, tính cách, logic.\n*  Kiểm tra chất lượng:\n   Nhất quán: Tên nhân vật, xưng hô không thay đổi trong văn bản.\n   Tự động kiểm tra: Scan lỗi pinyin (VD: 'nihao'), ký tự Trung (VD: 你好), thuật ngữ thô (VD: 'liền tựu thị').\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n<VÍ_DỤ>\n</VÍ_DỤ>\n LƯU Ý 2: KHÔNG ĐƯỢC SỬ DỤNG DẤU NHÁY KÉP, NHÁY ĐƠN TRONG PROM sẽ gây lỗi");
                }
                prompts[langId] = localStorage.getItem(langId);
            }
        }
    } catch (e) {}

    if (!text || text.trim() === '') {
        return Response.success("?");
    }
// Xử lý gộp key từ config và localStorage
    var combinedApiKeys = [].concat(apiKeys); 

    let uniqueKeys = [];
    let seenKeys = {};
    for (let i = 0; i < combinedApiKeys.length; i++) {
        if (!seenKeys[combinedApiKeys[i]]) {
            seenKeys[combinedApiKeys[i]] = true;
            uniqueKeys.push(combinedApiKeys[i]);
        }
    }
    combinedApiKeys = uniqueKeys;
// Xoay vòng key
    var apiKeyStorageKey = "vbook_last_api_key_index";
    var rotatedApiKeys = combinedApiKeys; 
    try {
        if (combinedApiKeys && combinedApiKeys.length > 1) {
            let lastUsedIndex = parseInt(cacheStorage.getItem(apiKeyStorageKey) || "-1");
            let nextIndex = (lastUsedIndex + 1) % combinedApiKeys.length;
            rotatedApiKeys = combinedApiKeys.slice(nextIndex).concat(combinedApiKeys.slice(0, nextIndex));
            cacheStorage.setItem(apiKeyStorageKey, nextIndex.toString());
        }
    } catch (e) {
        rotatedApiKeys = combinedApiKeys;
    }

    var lines = text.split('\n');
    
    if (to === 'PROMPT_xoacache') {
            let cacheKeyToDelete = generateFingerprintCacheKey(lines);
            if (cacheStorage.getItem(cacheKeyToDelete) !== null) {
                cacheStorage.removeItem(cacheKeyToDelete);
                return Response.success("Đã xóa cache của chương này thành công." + text);
            }        
        return Response.success(text); 
    }

    let isShortTextOrList = false;
    let lengthThreshold = 1000;   
    let lineLengthThreshold = 25; 
    if (to === 'PROMPT_vietlai') {
        lengthThreshold = 1200;
        lineLengthThreshold = 50;
    }
    if (text.length < lengthThreshold) {
        isShortTextOrList = true;
    } else {
        let shortLinesCount = 0;
        let totalLines = lines.length;
        if (totalLines > 0) {
            for (let i = 0; i < totalLines; i++) {
                if (lines[i].length < lineLengthThreshold || lines[i].toLowerCase().includes("chương") || lines[i].includes("章")) { shortLinesCount++; }
            }
            if ((shortLinesCount / totalLines) > 0.7) {
                isShortTextOrList = true;
            }
        }
    }
    if (to === 'PROMPT_vietlai' && isShortTextOrList) {
        return Response.success(text);
    }

    var finalContent = "";
    let useGeminiForShortText = false;
    
    if (isShortTextOrList) {
        let basicLangs = ['zh', 'en', 'vi', 'auto'];
        if (basicLangs.indexOf(from) > -1 && basicLangs.indexOf(to) > -1) {
            useGeminiForShortText = true;
        }
    }

    if (isShortTextOrList && !useGeminiForShortText) {
        const BAIDU_CHUNK_SIZE = 300;
        let baiduTranslatedParts = [];

        for (let i = 0; i < lines.length; i += BAIDU_CHUNK_SIZE) {
            let currentChunkLines = lines.slice(i, i + BAIDU_CHUNK_SIZE);
            let chunkText = currentChunkLines.join('\n');
            let translatedChunk = baiduTranslateContent(chunkText, from, to, 0); 
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
                let cachedTranslation = cacheStorage.getItem(cacheKey);
                if (cachedTranslation) {
                    return Response.success(cachedTranslation);
                }
            } catch (e) {
                cacheKey = null;
            }
        }
        
        let modelToUse = null;
        let useModelLoop = false;
        let isPinyinRoute = false; 

        if (from.includes('gemini')) {
            modelToUse = from;
        } else {
            modelToUse = "gemini-2.5-flash-lite";
        }
        if (to.includes("gemini")) {
            to = "vi";
        }
        if (to.includes("PROMPT_") && to !== "PROMPT_vietlai" && to !== "PROMPT_xoacache" && to !== "vi" && to !== "en" && to !== "zh" && to !== "auto") {
            isPinyinRoute = true;
        }

        let selectedPrompt = prompts[to] || prompts['vi'];
        
        let translationSuccessful = false;
        let errorLog = {};
        let modelsToIterate = useModelLoop ? models : [modelToUse];

        for (let m = 0; m < modelsToIterate.length; m++) {
            let currentModel = modelsToIterate[m];
            let CHUNK_SIZE = 2000;
            let MIN_LAST_CHUNK_SIZE = 100;
            if (currentModel === "gemini-2.5-pro") {
                CHUNK_SIZE = 1500; MIN_LAST_CHUNK_SIZE = 100;
            } else if (currentModel === "gemini-2.5-flash" || currentModel === "gemini-2.5-flash-preview-09-2025" || currentModel === "gemini-2.0-flash-thinking-exp-01-21" || currentModel === "gemini-2.0-flash-exp") {
                CHUNK_SIZE = 2000; MIN_LAST_CHUNK_SIZE = 100;
            } else if (currentModel === "gemini-2.0-flash-001" || currentModel === "gemini-2.0-flash-lite-001") {
                CHUNK_SIZE = 2000; MIN_LAST_CHUNK_SIZE = 100;
            }
            let textChunks = [];
            let currentChunk = "";
            let currentChunkLineCount = 0;
//            const MAX_LINES_PER_CHUNK = 500;
            for (let i = 0; i < lines.length; i++) {
                let paragraph = lines[i];
                if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
                    textChunks.push(paragraph);
                    continue;
                }
                if ((currentChunk.length + paragraph.length + 1 > CHUNK_SIZE) && currentChunk.length > 0 ) {
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
                let lastChunk = textChunks.pop();
                let secondLastChunk = textChunks.pop();
                textChunks.push(secondLastChunk + "\n" + lastChunk);
            }

            let finalParts = [];
            let currentModelFailed = false;
            for (let k = 0; k < textChunks.length; k++) {
                var chunkToSend = textChunks[k];
                if (isPinyinRoute && !isShortTextOrList) {
                    try {
                        load("phienam.js");
                        chunkToSend = phienAmToHanViet(chunkToSend, minname, maxname, repeatname, to, prusepa_processed);
                    } catch (e) { return Response.error("LỖI: Không thể tải file phienam.js."); }
                }

                let chunkResult = translateChunkWithApiRetry(chunkToSend, selectedPrompt, currentModel, rotatedApiKeys, from, to);
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
                finalContent = finalContent.replace(/\*/g, '').trim();
                translationSuccessful = true;
                break; 
            }
        } 

        if (!translationSuccessful) {
            let errorString = "<<<<<--- LỖI DỊCH --->>>>>\n";
            for (let modelName in errorLog) {
                errorString += "\n--- Lỗi với Model: " + modelName + " ---\n";
                if(errorLog[modelName]) errorString += errorLog[modelName].join("\n");
            }
            return Response.error(errorString);
        }
    }

    if (cacheKey && finalContent && !finalContent.includes("LỖI DỊCH")) {
        if (cacheableModels.indexOf(modelsucess.trim()) > -1 && to !== 'PROMPT_layname') {
            try {
                cacheStorage.setItem(cacheKey, finalContent.trim());
            } catch (e) {}
        }
    }
    
    return Response.success(finalContent);
}