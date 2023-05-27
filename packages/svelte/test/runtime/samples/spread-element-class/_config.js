export default {
	html: "<div class='foo bar'>hello</div>",
	test({ assert, component, target }) {
		component.blah = 'goodbye';
		assert.htmlEqual(target.innerHTML, "<div class='foo bar'>goodbye</div>");
	}
};
