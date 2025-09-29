let languages = [
    {"id": "gemini-2.0-flash-001", "name": "Model: 2.0 Flash gemini-2.0-flash-001"},
    {"id": "gemini-2.0-flash-lite-001", "name": "Model: 2.0 Flash-lite gemini-2.0-flash-lite-001"},
    {"id": "gemini-2.0-flash-exp", "name": "Model: 2.0 Flash Exp gemini-2.0-flash-exp"},
    {"id": "gemini-2.0-flash-thinking-exp-01-21", "name": "2.0 thinking gemini-2.0-flash-thinking-exp-01-21"},
    {"id": "gemini-2.5-pro", "name": "Model: 2.5 Pro gemini-2.5-pro"},
    {"id": "gemini-2.5-flash-preview-09-2025", "name": "Model: 2.5 Flash Preview gemini-2.5-flash-preview-09-2025"},
    {"id": "gemini-2.5-flash", "name": "Model: 2.5 Flash gemini-2.5-flash"},
    {"id": "gemini-2.5-flash-lite", "name": "Model: 2.5 Flash Lite gemini-2.5-flash-lite"},
    {"id": "zh", "name": "Trung"},
    {"id": "en", "name": "Anh"},
    {"id": "vi", "name": "Việt"},
    {"id": "PROMPT_tieuchuan", "name": "Tiêu chuẩn"},
    {"id": "PROMPT_sac", "name": "Truyện Sắc"},
    {"id": "PROMPT_vietlai", "name": "Viết Lại Convert"},
    {"id": "PROMPT_xoacache", "name": "Xóa Cache Chương Này"}
];
// Hàm để chuẩn hóa tên prompt thành ID hợp lệ
function normalizeTextForId(text) {
    if (!text) return "";
    let normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    normalized = normalized.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return normalized.replace(/\s+/g, '_').toLowerCase();
}

// Logic để thêm các prompt tùy chỉnh từ config vào danh sách languages
try {
    if (typeof listprompts !== 'undefined' && listprompts) {
        let clean_listprompts = listprompts.replace(/^"([\s\S]*)"$/, "$1");

        let promptNames = (clean_listprompts || "").split('\n')
            .map(function(item) { return item.trim(); }) 
            .filter(function(item) { return item !== ""; }); 

        promptNames.forEach(function(name) {
            let id = "PROMPT_" + normalizeTextForId(name);
            
            languages.push({
                "id": id,
                "name": name
            });
        });
    }
} catch (e) {}

//Xử lý danh sách prompt có sử dụng phiên âm
var prusepa_processed = [];

try {
    if (typeof prusepa !== 'undefined' && prusepa) {
        let clean_prusepa = prusepa.replace(/^"([\s\S]*)"$/, "$1");

        prusepa_processed = (clean_prusepa || "").split('\n')
            .map(item => item.trim())
            .filter(item => item !== "")
            .map(namepa => {
                let normalizedName = normalizeTextForId(namepa);

                if (normalizedName.startsWith('prompt_')) {
                    return "PROMPT_" + normalizedName.substring(7); 
                } else {
                    return "PROMPT_" + normalizedName;
                }
            });
    }
} catch (e) {}