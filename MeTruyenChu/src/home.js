function execute() {
    return Response.success([
        {title: "Cập nhật", input: "/", script: "up.js"},
        {title: "Đề cử", input: "/", script: "up4.js"},
        {title: "Truyện HOT", input: "/", script: "up2.js"},
        {title: "Danh sách HOT", input: "/danh-sach/truyen-hot/", script: "gen.js"},
        {title: "Truyện hoàn thành", input: "/", script: "up3.js"},
    ]);
}