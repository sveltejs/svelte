import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	before_test() {
		const context = {
			fillStyle: '',
			fillRect() {}
		};
		// @ts-ignore
		HTMLCanvasElement.prototype.getContext = () => {
			return context;
		};
	},
	async test({ assert, target, component }) {
		const canvas = /** @type {HTMLCanvasElement} */ (target.querySelector('canvas'));
		const ctx = canvas.getContext('2d');
		assert.equal(ctx?.fillStyle, 'hsl(0, 100%, 40%)');

		canvas.click();
		flushSync();
		assert.equal(ctx?.fillStyle, 'hsl(10, 100%, 40%)');
	}
});
