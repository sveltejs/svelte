import { test } from '../../test';

export default test({
	get props() {
		return { name: 'world' };
	},

	async test({ assert, component, target, raf }) {
		// @ts-expect-error
		global.count = 0;

		component.visible = true;
		// @ts-expect-error
		assert.equal(global.count, 1);
		const div = /** @type {HTMLDivElement & { foo: Number }} */ (target.querySelector('div'));
		raf.tick(0);

		assert.equal(div.foo, 0);

		raf.tick(75);
		component.name = 'everybody';
		assert.equal(div.foo, 0.75);
		assert.htmlEqual(div.innerHTML, 'hello everybody!');

		component.visible = false;
		component.name = 'again';
		assert.htmlEqual(div.innerHTML, 'hello everybody!');

		raf.tick(125);
		assert.equal(div.foo, 0.25);

		component.visible = true;
		raf.tick(175);
		assert.equal(div.foo, 0.75);
		assert.htmlEqual(div.innerHTML, 'hello again!');

		raf.tick(200);
		assert.equal(div.foo, 1);

		raf.tick(225);
	}
});
