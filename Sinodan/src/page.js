load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var page = [];
        let check = doc.select(".pagelistbox option");
    if (check.size() > 0)  {
        doc.select(".pagelistbox option").forEach(e => {
          page.push(BASE_URL + e.attr("value"))
        });
        return Response.success(page)
    }
    else {page.push(url);
    return Response.success(page)}
    }
    return null;
}