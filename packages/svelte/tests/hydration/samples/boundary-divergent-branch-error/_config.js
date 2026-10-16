import { assert_ok, test } from '../../test';

export default test({
	server_props: { browser: false },
	props: { browser: true },
	snapshot(target) {
		return { button: target.querySelector('button') };
	},
	test(assert, target) {
		const button = target.querySelector('button');
		assert_ok(button);
		button.click();
		assert.equal(button.textContent, 'clicked');
	}
});
