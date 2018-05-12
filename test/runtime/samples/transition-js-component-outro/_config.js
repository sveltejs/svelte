export default {
	test(assert, component, target, window, raf) {
		const div = target.querySelector('div');

		component.outro().then(() => {
			assert.htmlEqual(target.innerHTML, '');
		});

		raf.tick(50);
		assert.equal(div.foo, 0.5);
		raf.tick(100);
	},
};
