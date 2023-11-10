import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>0</p>
		`
		);
	}
});
