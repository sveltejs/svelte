export default {
	html: '<div></div>',

	async test({ assert, target, window }) {
		const visibility = new window.Event('visibilitychange');

		await window.document.dispatchEvent(visibility);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<div class="tooltip">Perform an Action</div>
			</div>
		`
		);
	}
};
