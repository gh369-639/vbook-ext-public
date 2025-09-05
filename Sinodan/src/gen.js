load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    let response1 = fetch(url);
        if (response1.ok) {
            let doc = response1.html();
            let newUrl = doc.select("select option").first().attr("value");
            url = newUrl.match(/(.*_)/)[0];
        }
    let fullUrl = BASE_URL + url + page + ".html"; 
    let response = fetch(fullUrl);
    if (response.ok) {
        let doc1 = response.html();
        var data = [];
        doc1.select(".mod.block.book-all-list ul li").forEach(e => {
            data.push({
                name: e.select("a.name").text(),
                link: e.select("a.name").attr("href"),
                description: e.select(".info").text(),
                host: BASE_URL
            });
        });

        let nextPage = parseInt(page) + 1;

        return Response.success(data, nextPage.toString());
    }

    return null;
}