load("config.js");
function execute(url, page) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url + (page ? "/page/" + page : ""));
    if (response.ok) {
        let doc = response.html().select("body");
        let nd1 = doc.select('.noibat:has(+ .bai-viet-box:contains(Phân loại))')
        let nd2 = doc.select(".bai-viet-box:contains(Phân loại)");
        var data = [];
        for (let i = 0; i < Math.min(nd1.size(), nd2.size()); i++){
            let e1 = nd1.get(i).select("a").first();
            if (e1.text().includes("Top 1000")) continue;
            let e2 = nd2.get(i).select("a").first();
            data.push({
                name: e1.text(),
                link: e1.attr("href"),
                description: e2.text(),
                host: BASE_URL
            });
        }
        let next = doc.select(".page-numbers.current + a").text();
        if (next) return Response.success(data, next)
        else return Response.success(data)
    }
    return null
}