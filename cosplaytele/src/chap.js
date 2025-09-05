load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var doc = Http.get(url).html();
    var el = doc.select("#gallery-1 .gallery-item img");
    var data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var imgs = e.attr("src");
        data.push(imgs);
    }
    return Response.success(data);
}