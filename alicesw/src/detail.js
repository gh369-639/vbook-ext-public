load('config.js');

function execute(url) {
    url = url.match(/\d+/)[0];
    let response = fetch(BASE_URL + "/novel/" + url + ".html", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        }
    });
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
        //console.log(doc.select("ul.ranking-list").html())
        let ongoing = true
        if (doc.select(".box_info a[href*='author']").text().equals("已完结")) {ongoing = false;}

        return Response.success({
            name: doc.select(".box_info h1").first().text(),
            cover: doc.select(".pic img").attr("src"),
            detail: doc.select(".box_info .intro").text(),
            author: doc.select(".box_info a[href*='author']").text(),
            ongoing: ongoing,
            genres: genres,
            suggests: [{
                title: "View more",
                input: doc.select("ul.ranking-list").html(),
                script: "suggest.js"
            }]
        });
    }
    return null;
}