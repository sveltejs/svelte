export default {
	async test({ assert, component, target }) {
		assert.htmlEqual(target.innerHTML, 'Loading...');

		await component.promise;
		const span = target.querySelector('span');
		assert.equal(span.textContent, 'a');

		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		const change = new window.Event('change');

		options[1].selected = true;
		await select.dispatchEvent(change);

		assert.equal(span.textContent, 'b');
	}
};
