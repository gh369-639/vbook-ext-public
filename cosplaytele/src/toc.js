load('config.js');

function execute(url) {
    var doc = Http.get(url).html();
    const data = [
        {
            name: doc.select("#wrapper h1.entry-title").text(),
            url: url,
        }
    ];

    return Response.success(data);
}