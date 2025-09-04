load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        console.log(doc)
        var chapter = doc.select("#TextContent").html();
        return Response.success(chapter);
    }
    return null;
}