load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".mod.block.column-list .bd ul.list li").forEach(e => {
          data.push({
            name: e.select("p").text(),
            link: e.select("a").attr("href"),
            cover: e.select("img").attr("src"),
            host: BASE_URL
          })
        });
        return Response.success(data)
    }
    return null;
}