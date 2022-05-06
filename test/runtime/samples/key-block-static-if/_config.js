export default {
	html: `
		<section>
			<div>Second</div>
		</section>
		<button>Click</button>
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');

		await button.dispatchEvent(new window.Event('click'));

		assert.htmlEqual(target.innerHTML, `
			<section>
				<div>First</div>
				<div>Second</div>
			</section>
			<button>Click</button>
		`);
	}
};
