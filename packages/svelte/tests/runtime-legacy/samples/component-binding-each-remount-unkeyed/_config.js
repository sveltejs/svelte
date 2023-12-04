import { test } from '../../test';

export default test({
	html: `
		<div data-id="1">
			<inner>0</inner>
			<inner>1</inner>
		</div>
		<div data-id="2">
			<inner>0</inner>
			<inner>1</inner>
		</div>
		<div data-id="3">
			<inner>0</inner>
			<inner>1</inner>
		</div>
	`,

	ssrHtml: `
		<div data-id="1">
			<inner>0</inner>
			<inner>1</inner>
			<inner>2</inner>
		</div>
		<div data-id="2">
			<inner>0</inner>
			<inner>1</inner>
			<inner>2</inner>
		</div>
		<div data-id="3">
			<inner>0</inner>
			<inner>1</inner>
			<inner>2</inner>
		</div>
	`,

	async test({ assert, component, target }) {
		await component.done;
		// With Svelte 5, this is 9. With Svelte 4 it was 13.
		assert.equal(component.getCounter(), 9);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div data-id="3">
				<inner>0</inner>
				<inner>1</inner>
			</div>
			<div data-id="2">
				<inner>0</inner>
				<inner>1</inner>
			</div>
			<div data-id="1">
				<inner>0</inner>
				<inner>1</inner>
			</div>
		`
		);
	}
});
