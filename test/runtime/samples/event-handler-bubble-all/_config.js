export default {
	html: `
		<button>toggle</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>toggle</button>
			<p>hello!</p>
		`);

		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>toggle</button>
		`);
	}
};
