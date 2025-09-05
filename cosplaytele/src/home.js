load('config.js');

function execute() {
    return Response.success([
        {title: "Home", input: BASE_URL, script: "gen.js"},
        {title: "Best Cosplayer", input: BASE_URL + "/best-cosplayer", script: "genre3.js"},
        {title: "COSPLAY NUDE", input: BASE_URL + "/category/nude", script: "gen.js"},
        {title: "COSPLAY ERO", input: BASE_URL + "/category/no-nude", script: "gen.js"},
        {title: "COSPLAY", input: BASE_URL + "/category/cosplay", script: "gen.js"},
        {title: "Suggest", input: BASE_URL, script: "suggest.js"},
    ]);
}