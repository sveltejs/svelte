export default {
	html: `
		<details><summary>toggle</summary></details>
	`,

	async test({ assert, component, target, window }) {
		const details = target.querySelector('details');
		const event = new window.Event('toggle');

		details.open = true;
		await details.dispatchEvent(event);
		assert.equal(component.open, true);
		assert.htmlEqual(target.innerHTML, `
			<details open><summary>toggle</summary></details>
			<p>hello!</p>
		`);

		details.open = false;
		await details.dispatchEvent(event);
		assert.equal(component.open, false);
		assert.htmlEqual(target.innerHTML, `
			<details open=""><summary>toggle</summary></details>
		`);
	}
};
