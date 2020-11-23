export default {
	html: `
		<p>42</p>
		<p>42</p>
	`,

	async test({ assert, component, target }) {
		await component.updateStore(undefined);
		assert.htmlEqual(target.innerHTML, '<p>undefined</p><p>42</p>');

		await component.updateStore(33);
		assert.htmlEqual(target.innerHTML, '<p>33</p><p>42</p>');

		await component.updateStore(undefined);
		assert.htmlEqual(target.innerHTML, '<p>undefined</p><p>42</p>');

		await component.updateVar(undefined);
		assert.htmlEqual(target.innerHTML, '<p>undefined</p><p>undefined</p>');

		await component.updateVar(33);
		assert.htmlEqual(target.innerHTML, '<p>undefined</p><p>33</p>');

		await component.updateVar(undefined);
		assert.htmlEqual(target.innerHTML, '<p>undefined</p><p>undefined</p>');
	}
};
