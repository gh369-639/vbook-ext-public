load('config.js')
function execute(url) {
    url = url.match(/\d+/)[0];
    var chapters = [];
    var response = fetch(BASE_URL + "/other/chapters/id/" + url + ".html");
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