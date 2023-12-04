import { test } from '../../test';

export default test({
	get props() {
		return { visible: false };
	},

	html: `
		<div></div>
	`,

	test({ assert, component, target, raf }) {
		component.visible = true;
		const p = /** @type {HTMLParagraphElement & { foo: number }} */ (target.querySelector('p'));

		raf.tick(0);
		assert.equal(p.foo, 0);

		raf.tick(50);
		assert.equal(p.foo, 0.5);

		component.visible = false;

		raf.tick(75);
		assert.equal(p.foo, 0.25);

		raf.tick(100);
		assert.equal(p.foo, 0);
	}
});
