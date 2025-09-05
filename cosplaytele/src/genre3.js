load('config.js');

function execute(url) {
    const doc = Http.get(url).html();
    const el = doc.select("#content .col.medium-4.small-6.large-4");
    
    const data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var imgCv = e.select("img").attr("src")
        data.push({
            name: e.select(".text a").first().text(),
            link: e.select(".text a").first().attr("href"),
            cover: imgCv,
            host: BASE_URL
        })
    }
    
    
    return Response.success(data);
}