load('config.js');
function execute(url,page) {
    if (!page) page = 1;
    let response = fetch(url + "?page=" + page);
    if (response.ok) {
        let doc = response.html();
        console.log(doc)
        doc.select("tbody tr.head").remove();
        var data = [];
        doc.select("tbody tr").forEach(e => {
            data.push({
                name: e.select("td.t2 a").text(),
                cover: e.select("img").attr("src") || e.select("img").attr("data-src"),
                link: e.select("td.t2 a").attr("href"),
                description: e.select("td.t3 a").text(),
                host: BASE_URL
            });
        });
        var nextPage = doc.select(".pagination li").last().attr("class");
        if (nextPage === "disabled") {return Response.success(data)}
        else {
            nextPage = parseInt(page) + 1;
            return Response.success(data, nextPage);
        }
    }
    return Response.error("Đăng nhập để xem tủ sách");
}