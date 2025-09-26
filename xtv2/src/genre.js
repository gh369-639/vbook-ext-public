load("config.js");

function execute() {
    let response = fetch(BASE_URL)
    if (response.ok) {
        var data = [];
        let doc = response.html()
        doc.select('.phdr:contains(Thể loại) + .bai-viet-box, .phdr:contains(Top tác giả) + .bai-viet-box').forEach(e => {
            e.select("a").forEach(el => {
                data.push({
                title: el.text(),
                input: el.attr("href"),
                script: "gen3.js"
                })
            })
        })
    }
    return Response.success(data)
}