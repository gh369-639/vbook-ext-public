load('config.js');
function execute(url) {
    url = url.match(/\d+/)[0];
    let response = fetch(BASE_URL + "/novel/" + url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        }
    });
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("ul.ranking-list div.itemr").forEach(e => {
          data.push({
            name: e.select(".info a").text(),
            link: e.select(".info a").attr("href"),
            description: e.select("p").text(),
            cover: e.select("img").attr("src"),
          })
        });
        return Response.success(data)
    }
    return null;
}