load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let detail = "";
        doc.select(".book-info-text li").forEach(e => {
            let text = e.text().replace(/<[^>]*>?/gm, '');
            detail += text + "<br>";
        });
        return Response.success({
            name: doc.select(".mRightCol h1").first().text(),
            cover: doc.select(".book-info-pic img").attr("src"),
            author: doc.select(".book-info-text li").get(0).text(),
            description: doc.select(".mRightCol .scrolltext div").text(),
            detail: detail,
            host: BASE_URL
        });
    }
    return null;
}