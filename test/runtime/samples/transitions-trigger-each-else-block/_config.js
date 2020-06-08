export default {
	test({ component, target, assert, raf }) {
		assert.htmlEqual(target.innerHTML, 'a');

		component.arr = [];
		assert.htmlEqual(target.innerHTML, '<div>empty</div>');

		raf.tick(50);
		assert.equal(target.querySelector("div").foo, 0.5);
	},
};
