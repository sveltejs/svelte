export default {
	get props() {
		return { things: ['one', 'two', 'three'] };
	},

	test({ assert, component, target, raf }) {
		const { things } = component;

		component.things = [];
		const spans = target.querySelectorAll('span');

		raf.tick(25);
		assert.equal(spans[0].foo, 0.75);
		assert.equal(spans[1].foo, undefined);
		assert.equal(spans[2].foo, undefined);

		raf.tick(125);
		assert.equal(spans[0].foo, 0);
		assert.equal(spans[1].foo, 0.25);
		assert.equal(spans[2].foo, 0.75);

		component.things = things;
		raf.tick(225);

		assert.htmlEqual(
			target.innerHTML,
			`
			<span>one</span>
			<span>two</span>
			<span>three</span>
		`
		);

		assert.equal(spans[0].foo, 1);
		assert.equal(spans[1].foo, 1);
		assert.equal(spans[2].foo, 1);
	}
};
