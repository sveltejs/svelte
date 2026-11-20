import { test } from '../../test';

/** @param {string} operator */
const mismatch = (operator) =>
	`Reactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results`;

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, instance, warnings }) {
		const { array, object } = instance;

		/**
		 * @param {() => unknown} fn
		 * @param {unknown} result
		 * @param {string[]} expected_warnings
		 */
		function check(fn, result, expected_warnings = []) {
			warnings.length = 0;

			assert.equal(fn(), result, fn.toString());
			assert.deepEqual(warnings, expected_warnings, fn.toString());
		}

		// holes read as `undefined`, but they aren't proxies, so there's nothing to warn about.
		// (core-js feature-detects `Array.prototype.includes` with the first of these)
		check(() => [, 1].includes(undefined, 1), false);
		check(() => [, 1].indexOf(undefined), -1);
		check(() => [, 1].indexOf(undefined, -1), -1);
		check(() => [1, ,].lastIndexOf(undefined), -1);
		check(() => [, 1].lastIndexOf(undefined, 0), -1);

		// the proxy at index 1 is outside of the range that is searched
		check(() => array.includes(object, 2), false);
		check(() => array.includes(object, -1), false);
		check(() => array.indexOf(object, 2), -1);
		check(() => array.indexOf(object, -1), -1);
		check(() => array.lastIndexOf(object, 0), -1);
		check(() => array.lastIndexOf(object, -3), -1);

		// found values don't warn
		check(() => array.includes(array[1]), true);
		check(() => array.indexOf(array[1]), 1);
		check(() => array.lastIndexOf(array[1]), 1);

		// the proxy at index 1 is inside of the range that is searched
		check(() => array.includes(object), false, [mismatch('array.includes(...)')]);
		check(() => array.includes(object, 1), false, [mismatch('array.includes(...)')]);
		check(() => array.includes(object, -2), false, [mismatch('array.includes(...)')]);
		check(() => array.indexOf(object), -1, [mismatch('array.indexOf(...)')]);
		check(() => array.indexOf(object, 1), -1, [mismatch('array.indexOf(...)')]);
		check(() => array.indexOf(object, -2), -1, [mismatch('array.indexOf(...)')]);
		check(() => array.lastIndexOf(object), -1, [mismatch('array.lastIndexOf(...)')]);
		check(() => array.lastIndexOf(object, 1), -1, [mismatch('array.lastIndexOf(...)')]);
		check(() => array.lastIndexOf(object, -2), -1, [mismatch('array.lastIndexOf(...)')]);
	}
});
