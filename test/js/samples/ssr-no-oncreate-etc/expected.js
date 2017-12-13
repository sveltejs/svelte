"use strict";

var SvelteComponent = {};;

SvelteComponent.data = function() {
	return {};
};

SvelteComponent.render = function(state, options = {}) {
	var components = new Set();

	function addComponent(component) {
		components.add(component);
	}

	var result = { title: null, addComponent };
	var html = SvelteComponent._render(result, state, options);

	var cssCode = Array.from(components).map(c => c.css && c.css.code).filter(Boolean).join('\n');

	return {
		html,
		title: result.title,
		css: { code: cssCode, map: null },
		toString() {
			return result.html;
		}
	};
}

SvelteComponent._render = function(__result, state, options) {
	__result.addComponent(SvelteComponent);

	state = Object.assign({}, state);

	return ``;
};

SvelteComponent.css = {
	code: '',
	map: null
};

var warned = false;
SvelteComponent.renderCss = function() {
	if (!warned) {
		console.error('Component.renderCss(...) is deprecated and will be removed in v2 — use Component.render(...).css instead');
		warned = true;
	}

	var components = [];

	return {
		css: components.map(x => x.css).join('\n'),
		map: null,
		components
	};
};

module.exports = SvelteComponent;