load('config.js');
function execute(url) {    
    // 1. Khởi tạo trình duyệt ảo
    var browser = Engine.newBrowser();
    
    // 2. Mở URL. Chúng ta không cần timeout dài ở đây vì vòng lặp sẽ xử lý việc chờ.
    // Timeout ngắn (2-3 giây) chỉ để đảm bảo trang có đủ thời gian tải khung HTML ban đầu.
    browser.launch(url, 2000); 

    let htm = "";
    const maxTries = 20; // Tối đa 10 lần thử
    const delay = 500;  // Mỗi lần thử cách nhau 1 giây (1000ms)

    // 3. Bắt đầu vòng lặp kiểm tra
    for (var i = 0; i < maxTries; i++) {
        // Lấy HTML hiện tại của trang
        let doc = browser.html();
        
        // Lấy nội dung của phần tử cần đọc
        htm = doc.select(".content_txt, .read-content.j_readContent.user_ad_content").html();

        // Kiểm tra điều kiện thành công: nội dung đã tồn tại và không phải là thông báo loading
        if (htm && !htm.includes("正在加载小说中")) {
            Console.log("Đã tìm thấy nội dung sau " + (i + 1) + " giây.");
            break; // Thoát khỏi vòng lặp ngay khi tìm thấy nội dung
        }

        // Nếu chưa thành công, in ra log để debug và chờ 1 giây
        Console.log("Chưa tải xong, thử lại lần " + (i + 1) + "/" + maxTries);
        sleep(delay); 
    }

    // 4. Đóng trình duyệt để giải phóng tài nguyên
    browser.close();

    // 5. Kiểm tra kết quả cuối cùng sau khi vòng lặp kết thúc
    if (htm && !htm.includes("正在加载小说中")) {
        // Nếu thành công, trả về nội dung
        return Response.success(htm);
    } else {
        // Nếu sau 10 lần thử vẫn không thành công, trả về lỗi
        return Response.success(htm);
    }
}