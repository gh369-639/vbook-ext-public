load('config.js');
function execute(url) {
    let response = fetch(BASE_URL + url);
    console.log(BASE_URL + url)
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("a.yarpp-thumbnail").forEach(e => {
          data.push({
            name: e.attr("title"),
            link: e.attr("href"),
            cover: e.select("img").attr("data-src") || e.select("img").attr("src")
          })
        });
        return Response.success(data)
    }
    return null;
}