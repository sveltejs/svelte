import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		assert.htmlEqual(component.div.innerHTML, '<div>+</div><div>-</div>');

		const event = new window.Event('change');
		const input = target.querySelector('input');
		ok(input);

		input.checked = false;
		await input.dispatchEvent(event);
		await Promise.resolve();

		assert.htmlEqual(component.div.innerHTML, '<div>-</div><div>-</div>');
	}
});
