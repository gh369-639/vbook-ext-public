load("config.js");

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        doc.select("em").remove();
        doc.select("center").remove();
        let htm = doc.select(".ndtruyen").html();
        htm = htm.replace(/<br>|\n/g, "<br><br>");
        return Response.success(htm);
    }
    return null;
}
