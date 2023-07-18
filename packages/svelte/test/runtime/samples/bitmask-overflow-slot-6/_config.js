// overflow bitmask + slot missing `let:`
export default {
	html: `
		<div>
			<button slot="target">Toggle inside 1</button>
		</div>
		<button>Toggle outside</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelectorAll('button')[1];
		const div = target.querySelector('div');
		await div.dispatchEvent(new window.MouseEvent('click'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<button slot="target">Toggle inside 1</button>
				<div slot="content">Open</div>
			</div>
			<button>Toggle outside</button>
		`
		);

		await button.dispatchEvent(new window.MouseEvent('click'));
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<button slot="target">Toggle inside 2</button>
				<div slot="content">Open</div>
			</div>
			<button>Toggle outside</button>
		`
		);
	}
};
