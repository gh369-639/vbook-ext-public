var languageMap = {
    "auto": "auto",
    "zh": "zh",
    "en": "en",
    "vi": "vie"
};

function baiduTranslateContent(text, from, to, retryCount) {
    if (retryCount > 5) return null;
    if (from !== "zh" && from !== "en" && from !== "vi" && from !== "auto") from = "auto";
    if (!from || from === "auto") {
        from = baiduDetectLanguage(text);
    } else {
        from = languageMap[from] || from;
    }
    to = languageMap[to] || to;

    var data = {
        query: text,
        from: from,
        to: to,
        reference: "",
        corpusIds: [],
        needPhonetic: true,
        domain: "common",
        milliTimestamp: Date.now()
    };

    var response = fetch("https://fanyi.baidu.com/ait/text/translate", {
        method: 'POST',
        headers: {
            'Referer': 'https://fanyi.baidu.com/',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        var resultText = response.text();
        if (!resultText || resultText.trim() === '') {
            return baiduTranslateContent(text, from, to, retryCount + 1);
        }

        var parts = resultText.split("\n");
        var trans = "";

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.startsWith("data")) {
                try {
                    var obj = JSON.parse(part.substring(part.indexOf("{")));
                    var tranData = obj.data;
                    
                    if (tranData && tranData.event === "Translating" && tranData.list) {
                        var rData = tranData.list;
                        for (var j = 0; j < rData.length; j++) {
                            var item = rData[j];
                            if (item && item.dst) {
                                trans += item.dst + "\n";
                            }
                        }
                    }
                } catch (e) {
                    console.log("Lỗi parse JSON trong Baidu (dòng bị bỏ qua): " + e.toString());
                }
            }
        }
        
        if (trans.trim() !== "") {
            return trans.trim();
        }
    }

    return baiduTranslateContent(text, from, to, retryCount + 1);
}

function baiduDetectLanguage(text) {
    var sampleText = text.substring(0, Math.min(200, text.length));
    var response = fetch('https://fanyi.baidu.com/langdetect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // --- ĐÂY LÀ PHẦN SỬA LỖI ---
        body: JSON.stringify({ "query": sampleText }),
    });
    if (response.ok) {
        try {
            var jsonResponse = JSON.parse(response.text());
            if (jsonResponse && jsonResponse.error === 0 && jsonResponse.lan) {
                return jsonResponse.lan;
            }
        } catch(e) { console.log("Lỗi parse JSON trong baiduDetectLanguage: " + e.toString()); }
    }
    return "auto";
}