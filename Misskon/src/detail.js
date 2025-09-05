load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var genre = [];
        doc.select(".post-tag a").forEach(e => {
            genre.push({
                title: e.text(),
                input:e.attr("href").replace(/^(?:\/\/|[^/]+)*/, ''),
                script: "gen.js"
            })
        });
        return Response.success({
            name: doc.select("h1").first().text(),
            cover: doc.select(".entry p > img").first().attr("data-src") || doc.select(".entry img").first().attr("src"),
            detail: doc.select(".box-inner-block").text() + doc.select(".box-inner-block input").attr("value"),
            genres: genre,
            suggests: [{
                title: "View more",
                input: url.replace(/^(?:\/\/|[^/]+)*/, ''),
                script: "suggest.js"
            }]
        });
    }
    return null;
}