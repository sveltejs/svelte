export default {
	html: `
		<button>action</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const enter = new window.MouseEvent('mouseenter');
		const leave = new window.MouseEvent('mouseleave');
		const ctrlPress = new window.KeyboardEvent('keydown', { ctrlKey: true });

		await button.dispatchEvent(enter);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
			<div class="tooltip">Perform an Action</div>
		`
		);

		await window.dispatchEvent(ctrlPress);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
			<div class="tooltip">Perform an augmented Action</div>
		`
		);

		await button.dispatchEvent(leave);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
		`
		);
	}
};
