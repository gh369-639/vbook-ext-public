load('config.js')
function execute(url) {
    var chapters = [];
    let response = fetch(url);
    if (response.ok){
        let doc = fetch(url).html()
        let el = doc.select('#chapterList li a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href').replace(/^(?:\/\/|[^/]+)*/, ''),
                host: BASE_URL
            })
        });
        return Response.success(chapters);
    }
    return Response.success({
                name: url,
                url: url
            })
}