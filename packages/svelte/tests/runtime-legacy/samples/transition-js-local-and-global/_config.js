import { test } from '../../test';

export default test({
	get props() {
		return { x: false, y: true };
	},

	test({ assert, component, target, raf }) {
		// first, toggle x — first element should snap in
		// and out while second one transitions
		component.x = true;

		let divs = /** @type {NodeListOf<HTMLDivElement & { foo: number }>} */ (
			target.querySelectorAll('div')
		);
		raf.tick(0);
		assert.equal(divs[0].foo, undefined);
		assert.equal(divs[1].foo, 0);

		raf.tick(50);
		assert.equal(divs[0].foo, undefined);
		assert.equal(divs[1].foo, 0.5);

		raf.tick(100);

		component.x = false;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>snaps if x changes</div>
			<div>transitions if x changes</div>
		`
		);

		raf.tick(150);
		assert.equal(divs[0].foo, undefined);
		assert.equal(divs[1].foo, 0.5);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');

		// then toggle y
		component.y = false;
		component.x = true;
		component.y = true;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>snaps if x changes</div>
			<div>transitions if x changes</div>
		`
		);
		divs = /** @type {NodeListOf<HTMLDivElement & { foo: number }>} */ (
			target.querySelectorAll('div')
		);

		raf.tick(250);
		assert.equal(divs[0].foo, 0.5);
		assert.equal(divs[1].foo, 0.5);

		raf.tick(300);
		assert.equal(divs[0].foo, 1);
		assert.equal(divs[1].foo, 1);

		component.y = false;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>snaps if x changes</div>
			<div>transitions if x changes</div>
		`
		);

		raf.tick(320);
		assert.equal(divs[0].foo, 0.8);
		assert.equal(divs[1].foo, 0.8);

		raf.tick(400);
		assert.htmlEqual(target.innerHTML, '');
	}
});
