load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(BASE_URL + url);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".wrapper.homepage .item").forEach(e => {
            let bookUrl = BASE_URL + "/" + e.select("a").first().attr("href");
            let bookResponse = fetch(bookUrl);
            if (bookResponse.ok) {
                let bookDoc = bookResponse.html();
                let coverUrl = bookDoc.select(".book-info-pic img").attr("src");
                data.push({
                    name: bookDoc.select(".mRightCol h1").text(),
                    link: bookUrl,
                    description: bookDoc.select(".mRightCol .scrolltext div").text(),
                    cover: BASE_URL + coverUrl,
                    host: BASE_URL
                });
            }
        });
        return Response.success(data);
    }
    return null;
}