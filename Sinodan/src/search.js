load('config.js');
function execute(key, page) {
    if (!page) page = '1';
    var key = encodeURIComponent(key)
    let response = fetch(BASE_URL +  "/search_top_" + key + "_130_" + page + ".html")
    if (response.ok) {
        let doc1 = response.html();
        var data = [];
        doc1.select(".mod.block.book-all-list ul li").forEach(e => {
            data.push({
                name: e.select("a.name").text(),
                link: e.select("a.name").attr("href"),
                description: e.select(".info").text(),
                host: BASE_URL
            });
        });
        let nextPage = parseInt(page) + 1;
        return Response.success(data,nextPage.toString());
    }
    return null;
}
