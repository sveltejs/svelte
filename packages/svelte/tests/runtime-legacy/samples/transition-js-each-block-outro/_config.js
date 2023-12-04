import { test } from '../../test';

export default test({
	get props() {
		return { things: ['a', 'b', 'c'] };
	},

	test({ assert, component, target, raf }) {
		const divs = /** @type {NodeListOf<HTMLDivElement & { foo: number }>} */ (
			target.querySelectorAll('div')
		);

		component.things = ['a'];

		raf.tick(50);
		assert.equal(divs[0].foo, undefined);
		assert.equal(divs[1].foo, 0.5);
		assert.equal(divs[2].foo, 0.5);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div>a</div>');
	}
});
