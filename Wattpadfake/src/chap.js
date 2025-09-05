function execute(url) {

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        doc.select("script").remove();
        doc.select("div.content div").remove();
        let htm = doc.select("div.content").html();
        htm = htm.replace(/(<br>\s*){2,}/g, '<br>');
        htm = htm.replace(/<a[^>]*>([^<]+)<\/a>/g, '');
        htm = htm.replace(/&(nbsp|amp|quot|lt|gt);/g, "");
        htm = htm.replace(/<!--(<br \/>)?[^>]*-->/gm, '');
        htm = htm.replace(/\&nbsp;/g, "");
        return Response.success(htm);
    }
    return null;
}