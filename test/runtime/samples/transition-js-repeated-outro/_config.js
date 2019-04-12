export default {
	test({ assert, component, target, raf }) {
		component.number = 10;
		const span = target.querySelector('span');

		raf.tick(50);
		assert.equal(span.foo, 0.5);

		component.number = 9;
		raf.tick(60);
		assert.equal(span.foo, 0.4);

		component.number = 8;
		raf.tick(70);
		assert.equal(span.foo, 0.3);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, ``);

		component.number = 11;
		raf.tick(120);
		assert.equal(span.foo, 0.2);
		assert.htmlEqual(target.innerHTML, `
			<span>hello</span>
		`);
	},
};
