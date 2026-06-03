import { ok, test } from '../../test';

export default test({
	async test({ target }) {
		const button = target.querySelector('button');
		ok(button);
		button.dispatchEvent(new window.MouseEvent('mouseenter'));
	}
});
