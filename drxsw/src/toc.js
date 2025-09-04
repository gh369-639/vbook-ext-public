load('config.js')
function execute(url) {
    var chapters = [];
    let response = fetch(url);
    if (response.ok){
        let doc = response.html()
        doc.select('#chapterList .lazyrender a').forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href'),
                host: BASE_URL
            })
        });
        return Response.success(chapters);
    }
    return null
}