load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    let data = [];
    if (response.ok) {
        let doc = response.html().select(".ndtruyen");
        let book = doc.select(".list2");
        book.forEach(el => {
            data.push({
                name: el.text(),
                link: el.select("a").attr("href"),
                host: BASE_URL
            });
        });
    }
    return Response.success(data);
}