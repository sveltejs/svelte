var SvelteComponent = {};

SvelteComponent.data = function() {
	return {};
};

SvelteComponent.render = function(state, options) {
	state = state || {};

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

module.exports = SvelteComponent;
