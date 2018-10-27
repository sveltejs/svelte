const glob = require("tiny-glob/sync.js");

require("./setup");

glob("*/index.js", { cwd: "test" }).forEach(function(file) {
	require("./" + file);
});