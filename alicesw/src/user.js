load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        console.log(doc)
        doc.select("tbody tr.head").remove();
        var data = [];
        doc.select("tbody tr").forEach(e => {
            data.push({
                name: e.select("td.t2 a").text(),
                cover: e.select("img").attr("src") || e.select("img").attr("data-src"),
                link: e.select("td.t2 a").attr("href"),
                description: e.select("td.t3 a").text(),
                host: BASE_URL
            });
        });
        return Response.success(data);
    }
    return Response.success([{
                name: "Đăng nhập AliceSW để xem tủ sách của bạn",
                link: "/user/user/login.html",
                description: "tạo tài khoản rồi đăng nhập",
                host: BASE_URL
            }]);
}