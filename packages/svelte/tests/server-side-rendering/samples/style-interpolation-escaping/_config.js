import { test } from '../../test';

export default test({
	props: {
		special: '<&"',
		value: {
			/** @param {string} hint */
			[Symbol.toPrimitive](hint) {
				return `${hint}<&"`;
			}
		}
	}
});
