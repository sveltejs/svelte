"use strict";

var Main = {};

Main.filename = "src/Main.html";

Main.data = function() {
	return {};
};

Main.render = function(state, options = {}) {
	var components = new Set();

	function addComponent(component) {
		components.add(component);
	}

	var result = { head: '', addComponent };
	var html = Main._render(result, state, options);

	var cssCode = Array.from(components).map(c => c.css && c.css.code).filter(Boolean).join('\n');

	return {
		html,
		head: result.head,
		css: { code: cssCode, map: null },
		toString() {
			return html;
		}
	};
}

Main._render = function(__result, ctx, options) {
	__result.addComponent(Main);

	ctx = Object.assign({}, ctx);

	return `<p>Hello world!</p>`;
};

Main.css = {
	code: '',
	map: null
};

var warned = false;

module.exports = Main;