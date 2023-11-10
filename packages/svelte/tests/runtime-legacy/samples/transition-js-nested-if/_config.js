import { test } from '../../test';

export default test({
	get props() {
		return { x: false, y: true };
	},

	test({ assert, component, target, raf }) {
		component.x = true;

		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));

		raf.tick(0);
		assert.equal(div.foo, 0);

		raf.tick(100);
		assert.equal(div.foo, 1);

		component.x = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');

		raf.tick(150);
		assert.equal(div.foo, 0.5);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
	}
});
