const fs = require("fs");
const path = require("path");
const { compile } = require("./compiler.js");

const extensions = [".svelte", ".html"];
let es6Compiler;
let compileOptions = {};

function compileES6(code) {
	try {
		return es6Compiler(code);
	} catch (error) {
		console.log(`error compiling esm file ${error}`);
	}
}

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

function register(options = {}, es6_compiler) {
	if (options.extensions) {
		extensions.forEach(deregisterExtension);
		options.extensions.forEach(registerExtension);
	}

	// To compile mjs extensions
	if (es6_compiler) es6Compiler = es6_compiler;

	compileOptions = Object.assign({}, options);
	delete compileOptions.extensions;
}

function deregisterExtension(extension) {
	delete require.extensions[extension];
}

function registerExtension(extension) {
	require.extensions[extension] = function (module, filename) {
		const name = path
			.parse(filename)
			.name.replace(/^\d/, "_$&")
			.replace(/[^a-zA-Z0-9_$]/g, "");

		const options = Object.assign({}, compileOptions, {
			filename,
			name: capitalise(name),
			generate: compileOptions.generate || "ssr",
			format: "cjs",
		});

		const { js, css, ast, warnings, vars, stats } = compile(
			fs.readFileSync(filename, "utf-8"),
			options
		);

		if (options.dev) {
			warnings.forEach((warning) => {
				console.warn(`\nSvelte Warning in ${warning.filename}:`);
				console.warn(warning.message);
				console.warn(warning.frame);
			});
		}

		let compiled = module._compile(js.code, filename);
		return compiled;
	};
}

registerExtension(".svelte");
registerExtension(".html");

// To handle mixture of CJS and ESM modules .
require.extensions[".mjs"] = function (module, filename) {
	try {
		if (es6Compiler == null) {
			throw `error es6Compiler is not set`;
		}
		let code = compileES6(fs.readFileSync(filename, "utf-8")).code;
		return module._compile(code, filename);
	} catch (error) {
		console.log(`error ${error}`);
	}
};

module.exports = register;
