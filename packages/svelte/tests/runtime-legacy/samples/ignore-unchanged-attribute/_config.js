import { test } from '../../test';
import counter from './counter.js';

export default test({
	// TODO worth it to fix? arguably it's correct to always call the function, or rather it's undefined behavior as you shouldn't rely on render side effects
	// to fix it we would need to create many more signals (computeds) for this, or introduce some kind of dirty bitmask
	get props() {
		return { x: 1, y: 2 };
	},

	html: `
		<p>1</p>
		<p class='2'></p>
	`,

	test({ assert, component }) {
		counter.count = 0;

		component.x = 3;
		assert.equal(counter.count, 0);

		component.x = 4;
		component.y = 5;
		assert.equal(counter.count, 1);

		component.x = 5;
		component.y = 5;
		assert.equal(counter.count, 1);
	}
});
