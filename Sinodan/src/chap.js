load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        doc.select("center").remove();
        let htm = doc.select("#nr1").html();
        htm = htm.replace(/(<br>\s*){2,}/g, '<br>');
        htm = htm.replace(/<br>/g, '\n');
        return Response.success(htm);
    }
    else { return Response.success("bị lỗi fetch")}
}