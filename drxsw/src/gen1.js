load('config.js');

function execute(url) { 
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("#index_last .update_list ul li").forEach(e => {
            data.push({
                name: e.select("a").first().text(),
                link: e.select("a").first().attr("href"),
                host: BASE_URL
            });
        });
        return Response.success(data);
    }

    return null;
}