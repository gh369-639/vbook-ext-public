load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("#product ul li").forEach(e => {
          data.push({
            name: e.select("a h3").text(),
            link: e.select("a").first().attr("href"),
            cover: e.select("img").attr("data-src") || e.select("img").attr("src"),
            host: BASE_URL
          })
        });
        return Response.success(data)
    }
    return null;
}