load('config.js');

function execute() {
    return Response.success([
        {
            input: BASE_URL + "/book/index.html",
            title: "Mới cập nhật",
            script: "gen.js"
        },
        {
            input: BASE_URL + "/book/rate_1.html",
            title: "BXH nhân khí",
            script: "gen.js"
        },
        {
            input: BASE_URL + "/book/rate_2.html",
            title: "Nguyệt phiếu",
            script: "gen.js"
        },
        {
            input: BASE_URL + "/book/rate_3.html",
            title: "Sách mới",
            script: "gen.js"
        },
        {
            input: BASE_URL + "/book/rate_4.html",
            title: "Số lượng từ",
            script: "gen.js"
        }
    ]);
}