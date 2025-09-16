load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    let fullUrl = url + "?page=" + page; 
    let response = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        }
    });
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".clearfix.rec_rullist ul").forEach(e => {
            data.push({
                name: e.select("li.two a").text().replace(/文阅读/g, ""),
                link: e.select("li.two a").attr("href"),
                description: e.select("p").text(),
                host: BASE_URL
            });
        });
        let nextPage = parseInt(page) + 1;
        return Response.success(data, nextPage.toString());
    }
    return null;
}