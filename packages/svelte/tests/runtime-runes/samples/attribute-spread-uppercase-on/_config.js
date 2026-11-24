import { test } from '../../test';

export default test({
	html: `<button>click</button><svg></svg><my-element></my-element>`,

	test({ assert, target, window }) {
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));
		const svg = /** @type {SVGElement} */ (target.querySelector('svg'));
		const custom = /** @type {HTMLElement} */ (target.querySelector('my-element'));

		for (const element of [button, svg, custom]) {
			assert.equal(element.getAttributeNames().length, 0);
		}

		button.click();
		// @ts-ignore
		assert.equal(window.__count, undefined);
	}
});
