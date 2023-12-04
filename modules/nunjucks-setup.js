const nunjucks = require("nunjucks");
const path = require("path");


function setupNunjucks(dir, app) {
  nunjucks.configure(path.join(dir + "/views"), {
    autoescape: true,
    express: app,
  });

  app.set("view engine", "njk");
}

module.exports = { setupNunjucks };
