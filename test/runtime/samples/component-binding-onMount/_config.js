export default {
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
		<div id="target"><div></div>
			<p>
				Bound? true
			</p>
		</div>
	`
		);
	}
};
