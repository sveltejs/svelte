import { test } from '../../test';

let conversions = 0;

export default test({
	server_props: { value: 'server' },
	props: {
		value: {
			toString() {
				return String(++conversions);
			}
		}
	},

	test(assert, target) {
		// the value is converted exactly once, by `setAttribute`
		assert.equal(conversions, 1);
		assert.equal(target.querySelector('div')?.getAttribute('data-value'), '1');
	}
});
