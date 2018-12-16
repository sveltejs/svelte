export default {
	html: `
		<p><span class=''>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>1</span></p>

		<p><span class=''>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>1</span></p>

		<p><span class=''>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>1</span></p>

		<p><span class=''>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span class=''>1</span></p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click');
		const spans = target.querySelectorAll('span');

		await spans[0].dispatchEvent(click);

		assert.equal(component.currentIdentifier, 1);
		assert.htmlEqual(target.innerHTML, `
			<p><span class='selected'>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class='selected'>1</span></p>

			<p><span class='selected'>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class='selected'>1</span></p>

			<p><span class='selected'>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class='selected'>1</span></p>

			<p><span class='selected'>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class='selected'>1</span></p>
		`);

		await spans[0].dispatchEvent(click);

		assert.equal(component.currentIdentifier, null);
		assert.htmlEqual(target.innerHTML, `
			<p><span class=''>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>1</span></p>

			<p><span class=''>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>1</span></p>

			<p><span class=''>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>1</span></p>

			<p><span class=''>1</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>3</span></p>
			<p><span class=''>2</span></p>
			<p><span class=''>1</span></p>
		`);
	}
};
