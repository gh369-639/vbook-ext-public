load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var genres = [];
        doc.select(".box_info a[href*='=tag']").forEach(e => {
            genres.push({
                title: e.text(),
                input: e.attr("href"),
                script: "gen.js"
            })
        });
        let ongoing = false
        if (doc.select(".box_info a[href*='author']").text().equals("已完结")) {ongoing = true;}

        return Response.success({
            name: doc.select(".box_info h1").first().text(),
            cover: doc.select(".pic img").attr("src"),
            detail: doc.select(".box_info .intro").text(),
            author: doc.select(".box_info a[href*='author']").text(),
            ongoing: ongoing,
            host: BASE_URL,
            genres: genres,
            suggests: [{
                title: "View more",
                input: url,
                script: "suggest.js"
            }]
        });
    }
    return null;
}