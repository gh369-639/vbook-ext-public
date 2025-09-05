load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    let fullUrl = url + "?page=" + page; 
    let response = fetch(fullUrl);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".clearfix.rec_rullist ul").forEach(e => {
            data.push({
                name: e.select("li.two a").text(),
                link: e.select("li.two a").attr("href"),
                host: BASE_URL
            });
        });

        let nextPage = parseInt(page) + 1;

        return Response.success(data, nextPage.toString());
    }

    return null;
}