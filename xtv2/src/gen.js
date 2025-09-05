load("config.js");
function execute(url, page) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url + (page ? "/page/" + page : ""));
    if (response.ok) {
        let doc = response.html().select("body");
        doc.select(".noibat").last().remove();
        doc.select(".noibat").last().remove();
        var nd1 = doc.select(".noibat");
        var nd2 = doc.select(".noibat + .bai-viet-box");
        var data = [];
        for (var i = 1; i < Math.min(nd1.size(), nd2.size()); i++){
            var e1 = nd1.get(i).select("a").first();
            var e2 = nd2.get(i).select("a").first();
            data.push({
                name: e1.text(),
                link: e1.attr("href"),
                description: e2.text(),
                host: BASE_URL
            });
        }
        var next = doc.select(".page-numbers.current + a").text();
        if (next) return Response.success(data, next)
        else return Response.success(data)
    }
    return null
}