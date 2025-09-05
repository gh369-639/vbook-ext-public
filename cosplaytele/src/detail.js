load('config.js');

function execute(url) {   
    const doc = Http.get(url).html()

if (url.includes('/category')) {

return Response.success({
        name: doc.select("head > title").text(),
        cover: doc.select("#content img").first().attr("src"),
        detail: doc.select("head > title").text(),
        suggests: [
            {
                title: "Suggested",
                input: url,
                script: "gen.js"
            }
        ]
})
    } else {
    
let genres = [];
    doc.select("#wrapper h6.entry-category.is-xsmall a").forEach(e => {
        genres.push({
            title: e.text(),
            input: e.attr('href'),
            script: "gen.js"
        });
    });

        return Response.success({
        name: doc.select("#wrapper h1.entry-title").text(),
        cover: doc.select("#gallery-1 .gallery-item img").first().attr("src"),
        detail: doc.select("#wrapper h1.entry-title").text(),
        genres: genres,
        ongoing: false,
        suggests: [
            {
                title: "Suggested",
                input: doc.select("#wrapper h6.entry-category.is-xsmall a").get(2).attr("href"),
                script: "gen.js"
            }
        ]
    });
    }
}