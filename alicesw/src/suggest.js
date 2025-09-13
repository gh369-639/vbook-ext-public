load('config.js');
function execute(data) {
        let doc = Html.parse(data);
        var data = [];
        //console.log(doc.select("ul.ranking-list div.itemr"))
        doc.select("div.itemr").forEach(e => {
          data.push({
            name: e.select(".info a").text(),
            link: e.select(".info a").attr("href"),
            description: e.select("p").text(),
            cover: e.select("img").attr("src"),
          })
        });
        return Response.success(data)
}