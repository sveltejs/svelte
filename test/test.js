const glob = require("tiny-glob/sync.js");

require("./setup");

glob("**/__test__.js", { cwd: "src" }).forEach(function(file) {
	require("../src/" + file);
});

glob("*/index.js", { cwd: "test" }).forEach(function(file) {
	require("./" + file);
});
