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
//    prompts['vi_NameEng'] = getCleanedConfigString(prompt_name_eng);
//   prompts['vi_vietlai'] = getCleanedConfigString(prompt_rewrite);
//    prompts['vi_tieuchuan'] = getCleanedConfigString(prompt_tieuchuan);
//    prompts['vi_sac'] = getCleanedConfigString(prompt_sac);
} catch(e) {}

load("baidutranslate.js");

var modelsucess = "";
var models = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-flash-lite"
];

var pinyinOverlapThreshold = 0.6;

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

function getUniqueWords(text) {
    if (!text) return {};
    
    var lowerCaseText = text.toLowerCase();
    
    var words = lowerCaseText.split(/[\s,.;:!?()\[\]{}'"]+/);
    
    var uniqueWords = {};
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (word) {
            uniqueWords[word] = true;
        }
    }
    return uniqueWords;
}

function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    modelsucess = model;
    let maxop = 65536;
    if (model === "gemini-2.0-flash-exp" || model === "gemini-2.0-flash-thinking-exp-01-21" || model === "gemini-2.0-flash-lite-001" || model === "gemini-2.0-flash-001" ) maxop = 8192
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
                    var textResult = candidate.content.parts[0].text.trim();
                    if (/[\u4e00-\u9fff]/.test(textResult)) {
                        return { status: "error", message: "Kết quả chứa Hán tự, không hợp lệ." };
                    }
                    return { status: "success", data: textResult };
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

function translateChunkWithApiRetry(chunkText, prompt, modelToUse, keysToTry, isPinyinRoute) { // Thêm isPinyinRoute
    var keyErrors = [];
    for (var i = 0; i < keysToTry.length; i++) {
        var apiKeyToUse = keysToTry[i];
        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);
        
        if (result.status === "success") {
            if ((result.data.length / chunkText.length) < 0.5) {
                result.status = "short_result_error";
                result.message = "Kết quả trả về ngắn hơn 50% so với văn bản gốc.";
            }
            
            if (isPinyinRoute && result.status === "success" && result.data.length > 800) {
                var pinyinWords = getUniqueWords(chunkText);
                var pinyinWordCount = Object.keys(pinyinWords).length;
                
                if (pinyinWordCount > 0) { 
                    var translatedWords = getUniqueWords(result.data);
                    var overlapCount = 0;
                    
                    for (var word in translatedWords) {
                        if (pinyinWords[word]) { 
                            overlapCount++;
                        }
                    }
                    
                    var overlapPercentage = overlapCount / Object.keys(translatedWords).length;
                    
                    if (overlapPercentage > pinyinOverlapThreshold) {
                        result.status = "pinyin_overlap_error";
                        result.message = "Dịch lỗi: Kết quả giống phiên âm " + Math.round(overlapPercentage * 100) + "% (ngưỡng " + (pinyinOverlapThreshold * 100) + "%).";
                    }
                }
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

    try {
        var defaultPrompt2 = "<VAI_TRÒ>\nBạn là một **CHUYÊN GIA VIẾT TRUYỆN NGƯỜI LỚN**. Kỹ năng của bạn là sử dụng ngôn từ *táo bạo, trần trụi* để miêu tả *sâu sắc* tâm lý, cảm xúc và hành động của nhân vật một cách chân thực và gợi cảm.\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\nNhiệm vụ chính của bạn là chuyển thể một đoạn văn bản được cung cấp thành một tác phẩm truyện người lớn *hoàn chỉnh bằng tiếng Việt thuần túy*. Mục tiêu là tạo ra một câu chuyện hấp dẫn, tập trung vào ngôn ngữ thẳng thắn và tâm lý sâu sắc, **thay vì dịch thuật từng từ một cách máy móc**.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một đoạn văn bản gốc dưới dạng Hán-Việt convert. Bạn cần phải *viết lại* đoạn văn đó, biến nó từ một văn bản khó đọc thành một câu chuyện có hồn, mượt mà và phù hợp với độc giả Việt Nam.\n</BỐI_CẢNH>\n\n<HƯỚNG_DẪN>\nĐể hoàn thành mục tiêu, hãy tuân theo quy trình tư duy 3 bước sau:\n\n1.  **Phân tích và Thấu hiểu:** Đọc toàn bộ văn bản gốc để nắm bắt bối cảnh, diễn biến chính, và cảm xúc cốt lõi của nhân vật. Đừng bắt đầu viết lại ngay lập tức.\n\n2.  **Chuyển đổi Ngôn ngữ và Phong cách:**\n    *   ***Sử dụng Ngôn ngữ Trực diện:*** Dùng từ ngữ thẳng, không né tránh. **ÁP DỤNG NGHIÊM NGẶT** các bảng tra cứu 1-1 dưới đây:\n\n        **Bộ phận cơ thể (Nữ)**\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | âm hộ | lồn |\n        | âm đạo | lỗ lồn |\n        | ngọc môn | cửa lồn |\n        | mật huyệt | mật huyệt |\n        | âm thần | mép lồn |\n        | hoa thần | mép hoa |\n        | âm đế | hột le |\n        | âm hạch | mồng đốc |\n        | xử nữ mô | màng trinh |\n        | nhũ phòng | bầu vú |\n        | song phong | cặp vú |\n        | tuyết phong | đôi vú trắng |\n        | nhũ đầu | đầu ti |\n        | nhũ hoa | núm vú |\n        | đồn/tuyết đồn | mông/cặp mông trắng |\n        | thí cổ | cặp mông |\n\n        **Bộ phận cơ thể (Nam)**\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | dương cụ | cặc |\n        | long căn | dương vật lớn |\n        | cự long | cự long |\n        | nhục bổng | gậy thịt |\n        | quy đầu | quy đầu |\n        | âm nang | bìu dái |\n        | dịch hoàn | hai hòn dái |\n\n        **Dịch cơ thể**\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | tinh dịch | tinh dịch |\n        | dương tinh | tinh trùng |\n        | ái dịch | ái dịch |\n        | dâm thủy | dâm thủy |\n        | mật trấp | mật ngọt |\n\n        **Hành động & Trạng thái**\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | giao hợp | địt nhau |\n        | trừu sáp | nhấp |\n        | sáp nhập | thúc |\n        | vân vũ | mây mưa |\n        | khẩu giao | khẩu giao |\n        | xuy tiêu | thổi kèn |\n        | phủ mô | sờ soạng |/n        | nhựu lận | giày vò |\n        | thân ngâm | rên rỉ |\n        | cao trào | cao trào |\n        | lỏa thể | trần truồng |\n        | dục hỏa | lửa dục |\n        | xuân tâm | nứng |\n\n    *   ***Tập trung vào Chi tiết và Cảm xúc:*** Mô tả chi tiết, trần trụi các hành động. Nhấn mạnh vào *cảm xúc, ham muốn, suy nghĩ nội tâm* của nhân vật để câu chuyện có chiều sâu.\n\n3.  **Viết lại Câu chuyện:** Dựa trên sự thấu hiểu và các quy tắc ngôn ngữ, hãy viết lại câu chuyện bằng văn phong của riêng bạn, đảm bảo sự mượt mà và lôi cuốn.\n</HƯỚNG_DẪN>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **QUY TẮC CỐT LÕI:** **TUYỆT ĐỐI KHÔNG DỊCH TỪNG TỪ.**\n\n2.  **ĐẠI TỪ NHÂN XƯNG:**\n    *   **CẤM DÙNG:** *tôi, bạn, anh, em, chàng.*\n    *   **BẮT BUỘC ÁP DỤNG** bảng chuyển đổi sau:\n\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | Ta | ta |\n        | Ngươi | ngươi |\n        | Ngài | ngài |\n        | hắn | hắn |\n        | nàng | nàng |\n        | nó | nó |\n        | chúng ta | chúng ta |\n        | các ngươi | các ngươi |\n        | các nàng | các nàng |\n        | bọn họ | bọn họ |\n        | bọn chúng | bọn chúng |\n        | bản thân / chính mình | bản thân / chính mình |\n        | người khác | người khác |\n\n3.  **TÊN RIÊNG:**\n    *   **Tên người Trung Quốc:** **Giữ nguyên 100%** dạng Hán-Việt.\n    *   **Tên người nước ngoài (không phải Trung Quốc):** **Chuyển đổi** sang tên tiếng Anh/Latin.\n    *   **Tên địa danh, công pháp, vật phẩm:** **Giữ nguyên 100%** dạng Hán-Việt.\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   Giữ nguyên cấu trúc phân đoạn của văn bản gốc.\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n1.  **Ví dụ chuyển đổi tên người:**\n    | Tên gốc (Hán-Việt) | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | vương lâm | Vương Lâm |\n    | hách mễ lạp | Hermila |\n\n2.  **Ví dụ giữ nguyên tên riêng khác:**\n    | Tên gốc | Tên kết quả (Mục Tiêu) |\n    |---|---|\n    | thanh vân kiếm | Thanh Vân Kiếm |\n    | hắc ám sâm lâm | Hắc Ám Sâm Lâm |\n</VÍ_DỤ>";
        var defaultPrompt1 = "<VAI_TRÒ>\nBạn là một **CHUYÊN GIA VIẾT LẠI VĂN HỌC**. Thế mạnh của bạn là khả năng *diễn giải sâu sắc*, chuyển thể những văn bản thô, khó đọc thành các tác phẩm văn học tiếng Việt *tự nhiên, trung thực và giàu cảm xúc*.\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\nNhiệm vụ chính của bạn là viết lại một đoạn văn bản Hán-Việt (convert) được cung cấp. Mục tiêu không phải là dịch máy móc, mà là **sáng tạo lại nó** thành một tác phẩm văn học thuần Việt, mượt mà, *phù hợp với thể loại truyện tương ứng*.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một đoạn văn bản gốc dưới dạng convert. Bạn cần phải thấu hiểu nội dung, bối cảnh, và thể loại của đoạn văn đó để *viết lại*, làm cho nó trở nên dễ đọc và hấp dẫn hơn đối với độc giả Việt Nam.\n</BỐI_CẢNH>\n\n<HƯỚNG_DẪN>\nĐể hoàn thành mục tiêu, hãy tuân theo quy trình tư duy 3 bước sau:\n\n1.  **Phân tích Thể loại:** Đọc lướt qua văn bản gốc để **xác định thể loại chính** (ví dụ: tiên hiệp, đô thị, đồng nhân...). Đây là bước quan trọng nhất để chọn đúng phong cách ngôn ngữ.\n\n2.  **Lựa chọn và Áp dụng Phong cách Ngôn ngữ:** Dựa vào thể loại đã xác định, hãy sử dụng từ ngữ phù hợp. Tham khảo các bảng hướng dẫn dưới đây:\n\n    *   ***Với truyện Tiên hiệp, Huyền huyễn (Phong cách cổ trang):***\n        | Từ góc | Nghĩa Tiếng Việt (Mục tiêu) |\n        |---|---|\n        | tu chân giới | tu chân giới |\n        | sơ kỳ | sơ kỳ |\n        | trung kỳ | trung kỳ |\n        | hậu kỳ | hậu kỳ |\n        | đỉnh phong | đỉnh phong |\n        | tiêu diêu | tiêu dao |\n        | thiên địa | thiên địa |\n        | hồi thượng sư | bẩm thượng sư |\n        | tâm niệm nhất động | tâm niệm khẽ động |\n        | phú dư | giao phó |\n        | linh căn | linh căn |\n        | ngũ hành | Ngũ Hành |\n        | kim, mộc, thủy, hỏa, thổ | Kim, Mộc, Thủy, Hỏa, Thổ |\n\n    *   ***Với truyện Đô thị (Phong cách hiện đại):***\n        | Từ góc | Nghĩa Tiếng Việt (Mục tiêu) |\n        |---|---|\n        | tổng tài | tổng tài |\n        | đổng sự trường | chủ tịch hội đồng quản trị |\n        | thiếu gia | thiếu gia |\n        | hào môn | hào môn |\n        | phú nhị đại | phú nhị đại |\n        | bảo phiêu | vệ sĩ |\n        | giáo hoa | hoa khôi của trường |\n        | đại lão | đại lão |\n        | bí thư | thư ký |\n        | công tư | công ty |\n        | đổng sự hội | hội đồng quản trị |\n        | thành thị | thành phố |\n        | công ngụ | căn hộ |\n        | tửu ba | quán bar |\n        | dạ tổng hội | hộp đêm |\n        | y viện | bệnh viện |\n        | bạn công thất | văn phòng |\n        | tổng thống sáo phòng | phòng tổng thống |\n        | đả kiểm | vả mặt |\n        | trang bức | trang bức |\n        | hôn nhân hợp đồng | hợp đồng hôn nhân |\n        | xuyên việt | xuyên không |\n        | kim thủ chỉ | bàn tay vàng / hệ thống |\n        | du đĩnh | du thuyền |\n        | nhân dân tệ | nhân dân tệ |\n        | mỹ nguyên / mỹ kim | đô la Mỹ |\n    \n    *   ***Với truyện Đồng nhân, có yếu tố Phương Tây/Anime/DC:***\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | tra khắc lạp | Chakra |\n        | vạn giải | Bankai |\n        | ác ma quả thực | trái Ác Quỷ |\n        | cao trung | trường cao trung |\n        | tiền bối | senpai |\n        | hậu bối | kouhai |\n        | lão sư | sensei |\n        | tinh linh | Tinh Linh / Elf |\n        | ải nhân | Người Lùn / Dwarf |\n        | cự long | Cự Long / Dragon |\n        | thú nhân | Thú Nhân / Orc |\n        | ác ma | Ác Ma / Demon |\n        | ma quỷ | Ma Quỷ / Devil |\n        | thiên sứ | Thiên Sứ / Angel |\n        | vong linh | Vong Linh |\n        | hấp huyết quỷ | ma cà rồng |\n        | lang nhân | Người Sói |\n        | ma pháp sư | Pháp Sư / Mage |\n        | kiếm sĩ | Kiếm Sĩ |\n        | chiến sĩ | Chiến Sĩ |\n        | kỵ sĩ | Kỵ Sĩ |\n        | cung tiễn thủ | Cung Thủ |\n        | thích khách | Sát Thủ / Thích Khách |\n        | mục sư | Mục Sư |\n        | triệu hoán sư | Triệu Hồi Sư |\n        | ma pháp | ma pháp |\n        | ma lực | ma lực |\n        | đấu khí | đấu khí |\n        | thánh quang | Thánh Quang |\n        | hắc ám | Hắc Ám |\n        | nguyền rủa | nguyền rủa |\n        | phong ấn | phong ấn |\n        | nguyên tố | nguyên tố |\n        | chủ giác | nhân vật chính |\n        | phản phái | nhân vật phản diện |\n        | nhiệm vụ | nhiệm vụ |\n        | hệ thống | hệ thống |\n        | nguyên tác | nguyên tác |\n        | kịch tình | tình tiết truyện |\n\n3.  **Viết lại một cách Tự nhiên:** Tập trung mô tả trung thực, chi tiết và cụ thể để làm cho câu chuyện sống động và đáng tin cậy.\n</HƯỚNG_DẪN>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **QUY TẮC CỐT LÕI:** **TUYỆT ĐỐI KHÔNG DỊCH TỪNG TỪ.**\n\n2.  **ĐẠI TỪ NHÂN XƯNG:**\n    *   **CẤM DÙNG:** *tôi, bạn, anh, em, chàng.*\n    *   **BẮT BUỘC ÁP DỤNG** bảng chuyển đổi sau:\n\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | Ta | ta |\n        | Ngươi | ngươi |\n        | Ngài | ngài |\n        | hắn | hắn |\n        | nàng | nàng |\n        | nó | nó |\n        | chúng ta | chúng ta |\n        | các ngươi | các ngươi |\n        | các nàng | các nàng |\n        | bọn họ | bọn họ |\n        | bọn chúng | bọn chúng |\n        | bản thân / chính mình | bản thân / chính mình |\n        | người khác | người khác |\n\n3.  **TÊN RIÊNG:**\n    *   **Tên người Trung Quốc:** **Giữ nguyên 100%** dạng Hán-Việt.\n    *   **Tên người nước ngoài (không phải Trung Quốc):** **Chuyển đổi** sang tên tiếng Anh/Latin.\n    *   **Tên địa danh, công pháp, vật phẩm:** **Giữ nguyên 100%** dạng Hán-Việt.\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   Giữ nguyên cấu trúc phân đoạn của văn bản gốc.\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n1.  **Ví dụ chuyển đổi tên người:**\n    | Tên gốc | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | vương lâm | Vương Lâm |\n    | hách mễ lạp | Hermila |\n\n2.  **Ví dụ giữ nguyên tên riêng khác:**\n    | Tên gốc (Hán-Việt) | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | thanh vân kiếm | Thanh Vân Kiếm |\n    | hắc ám sâm lâm | Hắc Ám Sâm Lâm |\n</VÍ_DỤ>";
        var defaultPrompt3 = "<VAI_TRÒ>\nBạn là một **CHUYÊN GIA VIẾT LẠI VĂN HỌC**, đặc biệt chú trọng vào việc *xử lý tên riêng THEO QUY TẮC.*\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\nNhiệm vụ chính của bạn là viết lại văn bản Hán-Việt (convert) được cung cấp thành truyện tiếng Việt *tự nhiên, giàu cảm xúc*, và **TUÂN THỦ NGHIÊM NGẶT QUY TẮC XỬ LÝ TÊN RIÊNG**.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một đoạn văn bản Hán-Việt (convert). Nhiệm vụ của bạn là chuyển thể nó một cách mượt mà, trong đó việc xử lý tên riêng là ưu tiên hàng đầu và phải tuyệt đối chính xác theo quy tắc.\n</BỐI_CẢNH>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **QUY TẮC XỬ LÝ TÊN NGƯỜI (QUAN TRỌNG NHẤT):**\n    *   **ÁP DỤNG NGHIÊM NGẶT** bảng logic dưới đây:\n\n    | Trường hợp | Hành động | Ví dụ | \n    |---|---|---|\n    | Tên là phiên âm vô nghĩa, thường dài (≥ 3 âm tiết) | **Dịch sang tên tiếng Anh** tương đương. | *Áo Lợi Duy Á* -> *Olivia* |\n    | Tên có cấu trúc Á Đông (Họ + Tên) hoặc có nghĩa | **Giữ nguyên 100% Hán-Việt**. | *Vương Lâm* -> *Vương Lâm* |\n\n2.  **TÊN RIÊNG KHÁC:**\n    *   **Giữ nguyên 100%** tên địa danh, công pháp, vật phẩm. \n\n3.  **ĐẠI TỪ NHÂN XƯNG:**\n    *   **Đối thoại:** Ưu tiên sử dụng *ta* và *ngươi*.\n    *   **Tường thuật (Ngôi thứ 3):** Suy luận giới tính để dùng *hắn* (nam) và *nàng* (nữ).\n    *   **CẤM DÙNG:** *tôi, bạn, anh, em, chàng.*\n    *   **BẮT BUỘC ÁP DỤNG** bảng chuyển đổi sau:\n\n        | Từ góc | Nghĩa Tiếng Việt (BẮT BUỘC) |\n        |---|---|\n        | Ta | ta |\n        | Ngươi | ngươi |\n        | Ngài | ngài |\n        | hắn | hắn |\n        | nàng | nàng |\n        | nó | nó |\n        | chúng ta | chúng ta |\n        | các ngươi | các ngươi |\n        | các nàng | các nàng |\n        | bọn họ | bọn họ |\n        | bọn chúng | bọn chúng |\n        | bản thân / chính mình | bản thân / chính mình |\n        | người khác | người khác |\n\n4.  **QUY TẮC CỐT LÕI:**\n    *   **TUYỆT ĐỐI KHÔNG DỊCH TỪNG TỪ.**\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được viết lại.\n*   Giữ nguyên cấu trúc phân đoạn của văn bản gốc.\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú, lời bình, hay giải thích nào vào nội dung trả về.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n1.  **Ví dụ xử lý Tên Người:**\n    | Tên gốc (Hán-Việt) | Tên kết quả (Mục tiêu) | Ghi chú |\n    |---|---|---|\n    | vương lâm | Vương Lâm | Giữ nguyên vì là tên Á Đông |\n    | hách mễ lạp | Hermila | Dịch vì là phiên âm |\n\n2.  **Ví dụ giữ nguyên Tên Riêng Khác:**\n    | Tên gốc (Hán-Việt) | Tên kết quả (Mục tiêu) |\n    |---|---|\n    | thanh vân kiếm | Thanh Vân Kiếm |\n    | hắc ám sâm lâm | Hắc Ám Sâm Lâm |\n</VÍ_DỤ>";
        var defaultPrompt4 = "<VAI_TRÒ>\nBạn là một **BIÊN TẬP VIÊN CHUYÊN NGHIỆP**. Nhiệm vụ của bạn là mài giũa một văn bản thô thành một tác phẩm hoàn chỉnh, mượt mà và dễ đọc.\n</VAI_TRÒ>\n\n<MỤC_TIÊU>\nBiên tập lại văn bản *convert* thô được cung cấp thành một tác phẩm tiếng Việt *mượt mà, tự nhiên và trôi chảy*. Mục tiêu chính là loại bỏ sự lủng củng, khó hiểu của văn bản gốc.\n</MỤC_TIÊU>\n\n<BỐI_CẢNH>\nNgười dùng sẽ cung cấp một đoạn văn bản convert. Bạn cần đóng vai trò là người biên tập cuối cùng, chỉ tập trung vào việc làm cho câu chữ hay hơn mà không thay đổi nội dung gốc.\n</BỐI_CẢNH>\n\n<RÀNG_BUỘC>\nĐây là những quy tắc **BẮT BUỘC** phải tuân thủ:\n\n1.  **LÀM MƯỢT CÂU VĂN:**\n    *   Viết lại các câu lủng củng, tối nghĩa, sai ngữ pháp.\n    *   Sắp xếp lại trật tự từ để câu văn nghe tự nhiên hơn theo văn phong tiếng Việt.\n\n2.  **VIỆT HÓA TỪ NGỮ:**\n    *   Chủ động thay thế các từ Hán-Việt không thông dụng hoặc không cần thiết bằng các từ thuần Việt tương đương.\n    *   *Ví dụ:* `thân hình hóa tác nhất đạo lưu quang` -> `thân hình hóa thành một vệt sáng`.\n\n3.  **TUYỆT ĐỐI BẢO TOÀN NỘI DUNG:**\n    *   **KHÔNG** thêm, bớt hay thay đổi cốt truyện, tình tiết, hành động.\n    *   **GIỮ NGUYÊN 100% TẤT CẢ TÊN RIÊNG** (nhân vật, địa danh, công pháp, vật phẩm...).\n</RÀNG_BUỘC>\n\n<ĐỊNH_DẠNG_ĐẦU_RA>\n*   **CHỈ** trả về văn bản tiếng Việt đã được biên tập.\n*   Giữ nguyên cấu trúc và số lượng đoạn văn của văn bản gốc.\n*   **TUYỆT ĐỐI KHÔNG** sử dụng Markdown (như **đậm**, *nghiêng*), không thêm bất kỳ ghi chú hay lời bình nào.\n</ĐỊNH_DẠNG_ĐẦU_RA>\n\n<VÍ_DỤ>\n*   **Văn bản gốc (Convert):**\n    `Ngã tâm niệm nhất động, thân hình hóa tác nhất đạo lưu quang, hướng về viễn phương bạo xạ nhi khứ.`\n*   **Kết quả mong muốn (Đã biên tập):**\n    `Tâm niệm hắn khẽ động, thân hình hóa thành một vệt sáng, lao vút về phía xa.`\n</VÍ_DỤ>";

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
        
        var prompt3 = localStorage.getItem('pr_nameenglish');
        if (!prompt3) { 
            prompt3 = defaultPrompt3;
            localStorage.setItem('pr_nameenglish', prompt3); 
        }
        prompts['vi_NameEng'] = prompt3;

        var prompt4 = localStorage.getItem('pr_vietlaicv');
        if (!prompt4) { 
            prompt4 = defaultPrompt4;
            localStorage.setItem('pr_vietlaicv', prompt4); 
        }
        prompts['vi_vietlai'] = prompt4;

    } catch (e) {
        prompts['vi_tieuchuan'] = defaultPrompt1;
        prompts['vi_sac'] = defaultPrompt2;
        prompts['vi_NameEng'] = defaultPrompt3;
        prompts['vi_vietlai'] = defaultPrompt4;
    }

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
        var validModels = ["gemini-2.5-pro", "gemini-2.5-flash-preview-05-20", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite-001", "gemini-2.0-flash-001", "gemini-2.0-flash-exp", "gemini-2.0-flash-thinking-exp-01-21"];
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
            var CHUNK_SIZE = 8000;
            var MIN_LAST_CHUNK_SIZE = 500;
            if (currentModel === "gemini-2.5-pro") {
                CHUNK_SIZE = 1500; MIN_LAST_CHUNK_SIZE = 100;
            } else if (currentModel === "gemini-2.5-flash" || currentModel === "gemini-2.5-flash-preview-05-20" || currentModel === "gemini-2.0-flash-thinking-exp-01-21" || currentModel === "gemini-2.0-flash-exp") {
                CHUNK_SIZE = 2000; MIN_LAST_CHUNK_SIZE = 500;
            } else if (currentModel === "gemini-2.0-flash-001" || currentModel === "gemini-2.0-flash-lite-001") {
                CHUNK_SIZE = 4000; MIN_LAST_CHUNK_SIZE = 500;
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
                var chunkResult = translateChunkWithApiRetry(chunkToSend, selectedPrompt, currentModel, rotatedApiKeys, isPinyinRoute);
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