load('config.js');

function execute() {
    return Response.success([
        {
            input: BASE_URL + "/original.html",
            title: "原创专区",
            script: "gen2.js"
        },
        {
            input: BASE_URL + "/all/order/update_time+desc.html",
            title: "最新小说列表",
            script: "gen2.js"
        },
        {
            input: BASE_URL + "/other/rank_hits/order/hits_day.html",
            title: "本日排行",
            script: "gen2.js"
        },
        {
            input: BASE_URL + "/other/rank_hits/order/hits_week.html",
            title: "本周排行",
            script: "gen2.js"
        },
        {
            input: BASE_URL + "/other/rank_hits/order/hits_month.html",
            title: "本月排行",
            script: "gen2.js"
        },
        {
            input: BASE_URL + "/other/rank_hits/order/hits.html",
            title: "总排行",
            script: "gen2.js"
        }
    ]);
}