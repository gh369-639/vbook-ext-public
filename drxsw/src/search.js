load('config.js');

function execute(key) {
    var q = encodeURIComponent(key)
    let response = fetch(BASE_URL + "/s.php", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `searchkey=${q}&searchtype=articlename&Submit=`
    });
    if (response.ok) {
        let doc = response.html();
        console.log(doc)
        var data = [];
        doc.select("#sitebox dl").forEach(e => {
            data.push({
                name: e.select("dd h3 a").text(),
                link: e.select("dd h3 a").attr("href"),
                cover: e.select("dt a img").attr("data-src") || e.select("dt a img").attr("src"),
                description: e.select("dd.book_des").text(),
                host: BASE_URL
            });
        });
        return Response.success(data);
    }

    return null;
}