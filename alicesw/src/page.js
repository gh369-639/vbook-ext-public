load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var page = [];
        doc.select(".book_newchap .tit.tabtitle a").forEach(e => {
          page.push(BASE_URL + e.attr("href"))
        });
        return Response.success(page)
    }
    return null;
}