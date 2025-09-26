load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let reschap =  fetch(url);
    if (reschap.ok) {
        var el = reschap.html().select("#gallery-1 .gallery-item img");
        var data = [];
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            var imgs = e.attr("src");
            data.push(imgs);
        }
        return Response.success(data);
    }
    return null;
}