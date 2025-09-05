load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    var data = [];
    if (response.ok) {
        let doc = response.html().select(".ndtruyen");
        doc.select("> p").first().remove();
        doc.select("> em").last().remove();
        var book = doc.select(".list2");
        book.forEach(el => {
            data.push({
                name: el.text(),
                link: el.select("a").attr("href").replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL),
                host: BASE_URL
            });
        });
    }
    return Response.success(data);
}