export default {
	html: `
		<span>bye</span><span>world</span>
		<span slot="a">hello world</span>
		$$slots: {"a":true,"default":true}
		Slot b is not available
		<slot compiler-ignore name="c"></slot>

		<span>bye world</span>
		<span slot="a">hello world</span>
		$$slots: {"a":true,"b":true,"default":true}
		<div><span slot="b">hello world</span></div>
		<slot compiler-ignore name="c"></slot>
	`,

	async test({ assert, component }) {
		assert.equal(component.getA(), '');
		assert.equal(component.getB(), 'foo');
	}
};
