load('config.js');

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var data = [{
            name: doc.select("h1").text(),
            url: url
            }];
        var imgs = doc.select(".page-link").first();
        imgs.select("a").forEach(e => {
            data.push({
                name: e.text(),
                url: e.attr("href")
            })
        })
        return Response.success(data);
    }
}