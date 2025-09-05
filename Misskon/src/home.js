load('config.js');

function execute() {
    return Response.success([
        {title: "Home page", input: "/", script: "gen.js"},
        {title: "Top 3 days", input: "/top3/", script: "gen.js"},
        {title: "Top 7 days", input: "/top7/", script: "gen.js"},
        {title: "Top 30 days", input: "/top30/", script: "gen.js"},
        {title: "Top 60 days", input: "/top60/", script: "gen.js"}
    ]);
}