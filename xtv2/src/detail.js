load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
            let doc = response.html();
            var genres = [];
            var tag = doc.select("tbody a");

            for (var i = 0; i < tag.size() - 1; i++) {
                var e = tag.get(i);
                genres.push({
                    title: e.text(),
                    input: e.attr("href"),
                    script: "gen3.js"
                    });
                }
            var suggests = [];
                suggests.push ({
                    title: "Cùng tác giả",
                    input: doc.select("tbody tr").get(2).select("a").attr("href"),
                    script: "gen3.js"
                    });
            return Response.success({
                name: doc.select("tbody tr").get(1).select("td").last().text(),
                author: doc.select("tbody tr").get(2).select("a").text(),
                description: doc.select("tbody tr").get(5).text(),
                detail: doc.select("tbody tr").get(6).text(),
                genres: genres,
                suggests: suggests,
                host: BASE_URL
                });
        }
        return null;
}
