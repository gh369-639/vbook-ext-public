function execute(url) {
    let baseUrl = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img)[0];
    let response = fetch(url);
    if (response.ok){
        let doc = response.html()
        let sid = doc.select('input[name=bid]').attr('value')
        let cPage = doc.select(".paging").select('a')
        if (cPage.length <=5){
            var allPage = cPage.length  - 1
        }else{
            var allPage = doc.select(".paging").select('a').last().attr('onclick').split(/[,)]/)[1]
        }
        Console.log(allPage)
        let list = [];
        if(allPage){
            for (var i = 1; i <=allPage; i++)
                list.push(`https://metruyenchu.com.vn/get/listchap/${sid}?page=${i}`);
        }else{
            list.push(url)
        }
        return Response.success(list);
    }

    
}