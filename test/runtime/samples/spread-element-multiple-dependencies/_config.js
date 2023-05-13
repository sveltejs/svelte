export default {
	html: "<div class='b' title='baz'></div>",
	test({ assert, component, target }) {
		component.foo = true;
		assert.htmlEqual(target.innerHTML, "<div class='a' title='baz'></div>");
	}
};
