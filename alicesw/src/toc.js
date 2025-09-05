load('config.js')
function execute(url) {
    var chapters = [];
    let response = fetch(url);
    if (response.ok){
        let doc = fetch(url).html()
        let el = doc.select('.mulu_list li a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href').replace(/^(?:\/\/|[^/]+)*/, '')
            })
        });
        return Response.success(chapters);
    }
}