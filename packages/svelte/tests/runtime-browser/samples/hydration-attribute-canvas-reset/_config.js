import { assert_ok, test } from '../../assert';

/** @param {HTMLCanvasElement} canvas */
function alpha(canvas) {
	const context = canvas.getContext('2d');
	assert_ok(context);
	return context.getImageData(0, 0, 1, 1).data[3];
}

export default test({
	mode: ['hydrate'],

	before_test() {
		for (const canvas of document.querySelectorAll('canvas')) {
			const context = canvas.getContext('2d');
			assert_ok(context);
			context.fillRect(0, 0, 1, 1);
			if (alpha(canvas) !== 255) throw new Error('expected a drawn pixel before hydration');
		}
	},

	test({ assert, target }) {
		const [attributes, spread] = target.querySelectorAll('canvas');

		// setting a canvas dimension resets its bitmap even when the value is unchanged
		assert.equal(alpha(attributes), 0);
		assert.equal(alpha(spread), 0);
		assert.equal(attributes.width, 30);
		assert.equal(spread.height, 30);
	}
});
