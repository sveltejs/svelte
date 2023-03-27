export default {
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
		assert.equal(component.getCounter(), 13);
		assert.htmlEqual(target.innerHTML, `
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
		`);
	}
};
