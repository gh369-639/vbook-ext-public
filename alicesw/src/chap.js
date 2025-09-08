load('config.js');
function execute(url) {    
    var browser = Engine.newBrowser();
    browser.launch(url, 3000); 

    let htm = "";
    const maxTries = 5; 
    const delay = 500;  

    for (var i = 0; i < maxTries; i++) {
        let doc = browser.html();
        htm = doc.select(".content_txt, .read-content.j_readContent.user_ad_content").html();
        if (htm && !htm.includes("正在加载小说中")) {
            Console.log("Đã tìm thấy nội dung sau " + (i + 1) + " giây.");
            break; 
        }
        sleep(delay); 
    }
    browser.close();

    if (htm) {
        if (!htm.includes("正在加载小说中")) {
            return Response.success(htm);
        } else {
            return Response.error;
        }
    } else {
        return Response.success("chap giới thiệu");
    }
}