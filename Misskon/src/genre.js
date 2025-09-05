load('config.js');
function execute() {
    let response = fetch(BASE_URL + "/sets");
    if (response.ok) {
        var doc = response.html();
        var genre = [];
        var danhmuc = doc.select(".entry").first();
        danhmuc.select("span a").forEach(e => {
            genre.push({
                title: e.text(),
                input: e.attr("href").replace(/^(?:\/\/|[^/]+)*/, ''),
                script: "gen.js"
            });
        });
        return Response.success(genre);
    }
    return null
}