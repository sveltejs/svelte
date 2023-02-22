export default {
	html: '<p>Fallback</p>',
	test({ assert, component, target }) {
		component.value = 1;
		assert.htmlEqual(target.innerHTML, `
			<p>One</p>
		`);

		component.value = 2;
		assert.htmlEqual(target.innerHTML, `
			<p>Two</p>
		`);

		component.value = 3;
		assert.htmlEqual(target.innerHTML, `
			<p>Fallback</p>
		`);

		component.value = 4;
		assert.htmlEqual(target.innerHTML, `
			<p>Fallback</p>
		`);
	}
};
