export default {
	test({ component, target, assert, raf }) {
		assert.htmlEqual(target.innerHTML, 'a');

		component.arr = [];
		assert.htmlEqual(target.innerHTML, '<div>empty</div>');

		// Transition in
		raf.tick(50);
		assert.equal(target.querySelector("div").foo, 0.5);

		raf.tick(100);
		assert.equal(target.querySelector("div").foo, 1);

		component.arr = ['a'];
		
		// Transition out
		raf.tick(150);
		assert.equal(target.querySelector("div").foo, 0.5);

		raf.tick(200);
		assert.equal(target.querySelector("div"), undefined);

		assert.htmlEqual(target.innerHTML, 'a');

	},
};
