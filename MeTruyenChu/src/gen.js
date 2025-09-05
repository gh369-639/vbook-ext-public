load('config.js');
function execute(url,page) {
    if(!page) page = '1';
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(BASE_URL + url + "?page=" + page);
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