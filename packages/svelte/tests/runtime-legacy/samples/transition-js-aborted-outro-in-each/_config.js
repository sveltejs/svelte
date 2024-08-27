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

		// intermediate ticks necessary for testing purposes, so that time
		// elapses after the initial delay animation's onfinish callback runs
		raf.tick(50);
		raf.tick(100);

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
});
