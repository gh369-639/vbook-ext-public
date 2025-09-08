function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("ul.ranking-list div.itemr").forEach(e => {
          data.push({
            name: e.select(".info a").text(),
            link: e.select(".info a").attr("href").match(/\d+/)[0],
            cover: e.select("img").attr("src"),
          })
        });
        return Response.success(data)
    }
    return null;
}