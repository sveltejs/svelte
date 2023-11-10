import { test } from '../../test';

export default test({
	get props() {
		return { x: true };
	},

	html: `
		<div>a</div>
	`,

	test({ assert, component, target, raf }) {
		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>a</div>
			<div>b</div>
		`
		);

		const [a, b] = /** @type {NodeListOf<HTMLDivElement & { a: number, b: number }>}} */ (
			target.querySelectorAll('div')
		);

		raf.tick(25);

		assert.equal(a.a, 0.75);
		assert.equal(b.b, 0.25);

		raf.tick(100);

		assert.equal(a.a, 0);
		assert.equal(b.b, 1);

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>b</div>
		`
		);
	}
});
