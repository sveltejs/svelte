const glob = require("glob");

require("./setup");

glob.sync("**/__test__.js", { cwd: "src" }).forEach(function(file) {
	require("../src/" + file);
});

glob.sync("*/index.js", { cwd: "test" }).forEach(function(file) {
	require("./" + file);
});
