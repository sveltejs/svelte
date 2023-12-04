import { test } from '../../test';

export default test({
	html: `
		<p>42</p>
		<p>42</p>
	`,

	async test({ assert, component, target }) {
		await component.updateStore(undefined);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p></p><p>42</p>');

		await component.updateStore(33);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p>33</p><p>42</p>');

		await component.updateStore(undefined);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p></p><p>42</p>');

		await component.updateVar(undefined);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p></p><p></p>');

		await component.updateVar(33);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p></p><p>33</p>');

		await component.updateVar(undefined);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p></p><p></p>');
	}
});
