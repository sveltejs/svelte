import { test } from '../../test';

export default test({
	get props() {
		return { things: ['one', 'two', 'three'] };
	},

	test({ assert, component, target, raf }) {
		const { things } = component;

		component.things = [];
		let spans = /** @type {NodeListOf<HTMLSpanElement & { foo: number }>} */ (
			target.querySelectorAll('span')
		);

		raf.tick(25);
		assert.equal(spans[0].foo, 0.75);
		assert.equal(spans[1].foo, undefined);
		assert.equal(spans[2].foo, undefined);

		raf.tick(125);
		assert.equal(spans[0].foo, 0);
		assert.equal(spans[1].foo, 0.25);
		assert.equal(spans[2].foo, 0.75);

		raf.tick(7);

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

		spans = /** @type {NodeListOf<HTMLSpanElement & { foo: number }>} */ (
			target.querySelectorAll('span')
		);

		assert.equal(spans[0].foo, undefined);
		assert.equal(spans[1].foo, undefined);
		assert.equal(spans[2].foo, undefined);
	}
});
