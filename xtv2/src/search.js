load('config.js');

function execute(key, page) {
    if (!page || page < 1) page = 1;

    const searchQuery = key + " truyện sex";

    const baseUrl = BASE_URL + "/tim-kiem/";
    const searchParams = `#gsc.tab=0&gsc.q=${encodeURIComponent(searchQuery)}&gsc.page=${page}`;
    const targetUrl = baseUrl + searchParams;

    let data = [];
    let browser = Engine.newBrowser();
    try {
        browser.launch(targetUrl, 3000);

        let retry = 0;
        while (retry < 30) { 
            sleep(100);
            let doc = browser.html();
            if (doc.select(".gsc-webResult.gsc-result").length > 0) {
                break;
            }
            retry++;
        }
        
        let finalDoc = browser.html();
        if (finalDoc.select(".gsc-webResult.gsc-result").length === 0) {
            browser.close();
            return Response.success([]);
        }

        finalDoc.select(".gsc-webResult.gsc-result").forEach(e => {
            let titleElement = e.select("a.gs-title").first();
            let link = titleElement.attr("href");
            let name = titleElement.text();
            if (name && link) {
                data.push({
                    "name": name,
                    "link": link,
                    "host": BASE_URL
                });
            }
        });
    } catch (error) {}
    finally {
        browser.close();
    }
    return Response.success(data, parseInt(page) + 1);
}