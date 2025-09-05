load('config.js');

function execute() {
    const doc = Http.get(BASE_URL + "/explore-categories/").html();
    const el = doc.select("#content .col-inner .col.medium-4.small-6.large-4");
    const data = [];
    for (var i = 0; i < el.size(); i++) {
        var imgCv = el.select(".banner-bg.fill > img").attr("src");
        var e = el.get(i);
        data.push({
           title: e.text(),
           input: e.select(".banner-layers.container a").attr('href'),
           cover: imgCv,
           script: 'gen.js'
        });
    }
    
    
    return Response.success(data);
}

