load('config.js');

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".entry p img").forEach(e => {
            var imgs = e.attr("data-src") || e.attr("src") ;
            data.push(imgs)
        })
    return Response.success(data);
    }
}