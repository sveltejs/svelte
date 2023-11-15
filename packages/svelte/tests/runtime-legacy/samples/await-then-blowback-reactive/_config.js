import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		assert.htmlEqual(target.innerHTML, 'Loading...');

		await component.promise;
		await Promise.resolve();
		const span = target.querySelector('span');
		ok(span);
		assert.equal(span.textContent, 'a');

		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		const change = new window.Event('change');

		options[1].selected = true;
		await select.dispatchEvent(change);
		await Promise.resolve();

		assert.equal(span.textContent, 'b');
	}
});
