function execute() {
    return Response.success([
        {title: "NEW", script: "gen.js", input: "https://www.wattpad.com/api/v3/stories?filter=new"},
        {title: "HOT", script: "gen.js", input: "https://www.wattpad.com/api/v3/stories?filter=hot"}
    ]);
}
