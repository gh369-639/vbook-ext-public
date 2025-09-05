load('config.js');

function execute(url) {
    const doc = Http.get(url).html()
    const el = doc.select("#footer .col-inner")
    
    const data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var imgCv = e.select(".box-image > div > a > img").attr("src")
        data.push({
            name: e.select(".box-image > div > a").first().attr("aria-label"),
            link: e.select(".box-image > div > a").first().attr("href"),
            cover: imgCv,
            host: BASE_URL
        })
    }

    return Response.success(data);
}