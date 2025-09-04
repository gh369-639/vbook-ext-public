load('config.js');

function execute() {
    return Response.success([
        {title: "更新列表", input: BASE_URL, script: "gen1.js"},
        {title: "Đề xuất", input: BASE_URL, script: "gen2.js"},
    ]);
}