load('config.js')
function execute(url) {
    url = url.match(/\d+/)[0];
    var chapters = [];
    var response = fetch(BASE_URL + "/other/chapters/id/" + url + ".html", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        }
    });
    if (response.ok){
        var doc = response.html()
        var el = doc.select('.mulu_list li a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href').replace(/^(?:\/\/|[^/]+)*/, '')
            })
        });
        return Response.success(chapters);
    }
}