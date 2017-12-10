var SvelteComponent = {};

SvelteComponent.data = function() {
	return {};
};

SvelteComponent.render = function(state, options = {}) {
	state = Object.assign({}, state);

	return ``;
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
