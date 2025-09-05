load('config.js');

function execute() {
    const doc = Http.get(BASE_URL).html();
    const el = doc.select("#main-menu .sub-menu.nav-sidebar-ul.children a");
    const data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        data.push({
           name: e.text(),
           cover: doc.select("#content img").attr("src"),
           link: e.attr('href'),
           input: e.attr('href'),
           script: 'gen.js',
           host: BASE_URL
        });
    }
    
    
    return Response.success(data);
}