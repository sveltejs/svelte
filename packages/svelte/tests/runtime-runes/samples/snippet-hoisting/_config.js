import { ok, test } from '../../test';

export default test({
	test({ target }) {
		const button = target.querySelector('button');
		ok(button);
		button.click();
	}
});
