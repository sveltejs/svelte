export default {
	html: `
		<span>bye</span><span>default</span>
		<span>hello a</span>
		$$slots: {"a":true,"default":true} {"a":true,"default":true}
		Slot b is not available
	`,

	async test({ assert, component, target }) {
		assert.equal(component.getData(), '{"a":true,"default":true}');
		
		component.show_b = true;
		assert.htmlEqual(target.innerHTML, `
			<span>bye</span><span>default</span>
			<span>hello a</span>
			$$slots: {"a":true,"b":true,"default":true} {"a":true,"b":true,"default":true}
			<div><span>hello b</span></div>
		`);
		assert.equal(component.getData(), '{"a":true,"b":true,"default":true}');

		component.show_default = false;
	}
};
