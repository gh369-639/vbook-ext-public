load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
            let doc = response.html();
            var genres = [];
            var tag = doc.select("tbody tr:contains(Thể loại), tbody tr:contains(Phân loại)").select("a");
            tag.forEach(function(e) {
                genres.push({
                    title: e.text(),
                    input: e.attr("href"),
                    script: "gen3.js"
                    });            });

            var suggests = [];
                suggests.push ({
                    title: "Cùng tác giả",
                    input: doc.select('tbody tr:contains(Tác giả)').select("a").attr("href"),
                    script: "gen3.js"
                    });
            return Response.success({
                name: doc.select('tbody tr:contains(Tên truyện)').select("td").last().text(),
                author: doc.select('tbody tr:contains(Tác giả)').select("a").text(),
                description: doc.select('tbody tr:contains(Tình trạng)').text(),
                detail: doc.select('tbody tr:contains(Ngày cập nhật)').text(),
                genres: genres,
                suggests: suggests,
                host: BASE_URL
                });
        }
        return null;
}
