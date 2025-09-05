load('config.js');
function execute(key,page) {
    if(!page) page = '1';
    let response = fetch(BASE_URL + "/search?q=" + encodeURIComponent(key) + "&page=" + page);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".truyen-list .item").forEach(e => {
          data.push({
            name: e.select("h3 a").first().text(),
            link: BASE_URL + e.select("a").first().attr("href"),
            cover: BASE_URL + e.select("a img").attr("src"),
            description: e.select("p a").first().text(),
            host: BASE_URL
          })
        });
        let next = (parseInt(page) + 1).toString();
        return Response.success(data,next)
    }
    return null;
}