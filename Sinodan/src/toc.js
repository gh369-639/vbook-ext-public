load('config.js')
function execute(url) {
    var chapters = [];
    let response = fetch(url);
    if (response.ok){
        let doc = fetch(url).html()
        
        // Chọn tất cả các phần tử có class ".mod.block.update.chapter-list"
        let chapterLists = doc.select(".mod.block.update.chapter-list");

        // Nếu tìm thấy 2 hoặc nhiều hơn, thì xóa phần tử đầu tiên
        if (chapterLists.size() > 1) {
            chapterLists.first().remove();
        }

        // Đoạn mã còn lại không thay đổi
        let el = doc.select('.mod.block.update.chapter-list ul.list li a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href'),
                host: BASE_URL
            })
        });
        return Response.success(chapters);
    }
}