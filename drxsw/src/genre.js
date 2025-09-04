load('config.js');
function execute() {
    let response = fetch(BASE_URL);
    if (response.ok) {
        var doc = response.html();
        var genre = [];
        var danhmuc = doc.select("#header .nav li a[id*=sort]");
        danhmuc.forEach(e => {
            genre.push({
                title: e.text(),
                input: BASE_URL + e.attr("href"),
                script: "gen.js"
            });
        });
        return Response.success(genre);
    }
    return null
}