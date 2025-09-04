load('config.js');

function execute(url, page) { 
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("#sitebox dl ").forEach(e => {
            data.push({
                name: e.select("dt span").text(),
                link: e.select("dt a").attr("href"),
                cover: e.select("dt a img").attr("data-src") || e.select("dt a img").attr("src"),
                host: BASE_URL
            });
        });
        return Response.success(data);
    }

    return null;
}