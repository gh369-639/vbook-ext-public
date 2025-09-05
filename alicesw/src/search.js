load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    var key = encodeURIComponent(key)
    let fullUrl = BASE_URL + "/search.html?q=" + key + "&f=_all" + page + "&serialize="; 
    let response = fetch(fullUrl);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".list-group .list-group-item").forEach(e => {
            data.push({
                name: e.select("h5").text(),
                link: e.select("h5 a").attr("href"),
                description: e.select("p").text(),
                host: BASE_URL
            });
        });

        let nextPage = parseInt(page) + 1;

        return Response.success(data, nextPage.toString());
    }

    return null;
}