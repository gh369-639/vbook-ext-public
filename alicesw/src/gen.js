load('config.js');
function execute(url, page) {
    if (!page) page = '1';
    let fullUrl = url + "&sort=hits_DESC&p=" + page + "&serialize="; 
    let response = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        }
    });
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".list-group .list-group-item").forEach(e => {
            data.push({
                name: e.select("h5").text(),
                link: e.select("h5 a").attr("href"),
                description: e.select("p").text(),
                host: BASE_URL
            });
        });
        let nextPage = parseInt(page) + 1;
        return Response.success(data, nextPage.toString());
    }
    return null;
}