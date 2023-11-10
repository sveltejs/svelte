import { test } from '../../test';

export default test({
	get props() {
		return { x: false, things: ['a'] };
	},

	test({ assert, component, target, raf }) {
		component.x = true;

		const div1 = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));

		raf.tick(0);
		assert.equal(div1.foo, undefined);

		raf.tick(100);
		assert.equal(div1.foo, undefined);

		component.things = ['a', 'b'];
		assert.htmlEqual(target.innerHTML, '<div></div><div></div>');

		const div2 = /** @type {HTMLDivElement & { foo: number }} */ (
			target.querySelector('div:last-child')
		);

		raf.tick(100);
		assert.equal(div1.foo, undefined);
		assert.equal(div2.foo, 0);

		raf.tick(200);
		assert.equal(div1.foo, undefined);
		assert.equal(div2.foo, 1);

		component.x = false;
		assert.htmlEqual(target.innerHTML, '');
	}
});
