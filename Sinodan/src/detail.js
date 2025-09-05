load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        return Response.success({
            name: doc.select(".mod.detail h1").first().text(),
            cover: doc.select(".mod.detail img").first().attr("src"),
            detail: doc.select(".mod.detail.info").text(),
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