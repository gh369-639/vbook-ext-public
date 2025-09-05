load('config.js')
function execute(url) {
    let baseUrl = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img)[0];
    const chapters = [];
    if (url.indexOf('listchap') > 0){
        let res = fetch(url).json()
        let html = Html.parse(res.data)
        let el = html.select('ul li a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href'),
                host: BASE_URL
            })
        });
        return Response.success(chapters);
    }else{
        let doc = fetch(url).html();
        let el = doc.select('#chapter-list ul li a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href'),
                host: BASE_URL
            })
        });
        return Response.success(chapters)
    }

}