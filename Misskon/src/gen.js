load('config.js');
function execute(url,page) {
    if(!page) page = '1';
    let response = fetch(BASE_URL + url + "/page/" + page);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".content .post-listing article.item-list").forEach(e => {
          data.push({
            name: e.select("h2 a").first().text(),
            link: e.select("a").first().attr("href"),
            cover: e.select("img").first().attr("data-src") || e.select("img").first().attr("src"),
            description: e.select(".post-meta").first().text(),
          })
        });
        let next = doc.select(".pagination .current + a").text();
        if (next)
        return Response.success(data,next)
        else
        return Response.success(data)
    }
    return null;
}