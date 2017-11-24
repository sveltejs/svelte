"use strict";

var SvelteComponent = {};;

SvelteComponent.data = function() {
	return {};
};

SvelteComponent.render = function(state, options = {}) {
	state = Object.assign({}, state);

	return ``.trim();
};

SvelteComponent.renderCss = function() {
	var components = [];

	return {
		css: components.map(x => x.css).join('\n'),
		map: null,
		components
	};
};

var escaped = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

function __escape(html) {
	return String(html).replace(/["'&<>]/g, match => escaped[match]);
}

module.exports = SvelteComponent;