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
		// In Svelte 4 this was 14, but in Svelte 5, the timing differences
		// because of async mean it's now 9.
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
