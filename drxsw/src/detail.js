load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        return Response.success({
            name: doc.select(".bookright .d_title h1").text(),
            author: doc.select(".bookright .d_title span").text(),
            cover: doc.select(".bookleft img").attr("data-src") || doc.select(".bookleft img").attr("src"),
            ongoing: doc.select("#count").text(),
            detail: doc.select("#bookintro").text(),
            host: BASE_URL,
            suggests: [{
                title: "View more",
                input: url,
                script: "suggest.js"
            }]
        });
    }
    return null;
}