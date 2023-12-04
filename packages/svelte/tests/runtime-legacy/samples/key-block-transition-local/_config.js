import { test } from '../../test';

export default test({
	get props() {
		return { x: false, y: 1 };
	},

	test({ assert, component, target, raf }) {
		component.x = true;

		let div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));
		raf.tick(0);
		assert.equal(div.foo, undefined);

		// play both in and out transition when changed with `{#key}`
		component.y = 2;
		assert.htmlEqual(target.innerHTML, '<div></div><div></div>');
		const [leaving, incoming] = /** @type {NodeListOf<HTMLDivElement & { foo: number }>} */ (
			target.querySelectorAll('div')
		);

		raf.tick(50);
		assert.equal(leaving.foo, 0.5);
		assert.equal(incoming.foo, 0.5);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(leaving.foo, 0);
		assert.equal(incoming.foo, 1);

		// do not play out transition when removed by `{#if}`
		component.x = false;
		assert.htmlEqual(target.innerHTML, '');

		// do not play in transition when added back with `{#if}`
		component.x = true;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));
		assert.equal(div.foo, undefined);
	}
});
