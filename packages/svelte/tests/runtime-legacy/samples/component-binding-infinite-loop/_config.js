import { test } from '../../test';

export default test({
	// Svelte 4/5 difference: The empty class strings are not added to the class attribute in this situation
	html: `
		<p><span>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>1</span></p>

		<p><span>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>1</span></p>

		<p><span>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>1</span></p>

		<p><span>1</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>3</span></p>
		<p><span class='selected'>2</span></p>
		<p><span>1</span></p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });
		const spans = target.querySelectorAll('span');

		await spans[0].dispatchEvent(click);
		await Promise.resolve();

		assert.equal(component.currentIdentifier, 1);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p><span class='selected'>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span class='selected'>1</span></p>

			<p><span class='selected'>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span class='selected'>1</span></p>

			<p><span class='selected'>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span class='selected'>1</span></p>

			<p><span class='selected'>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span class='selected'>1</span></p>
		`
		);

		await spans[0].dispatchEvent(click);
		await Promise.resolve();

		assert.equal(component.currentIdentifier, null);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p><span>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span>1</span></p>

			<p><span>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span>1</span></p>

			<p><span>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span>1</span></p>

			<p><span>1</span></p>
			<p><span>2</span></p>
			<p><span>3</span></p>
			<p><span>2</span></p>
			<p><span>1</span></p>
		`
		);
	}
});
