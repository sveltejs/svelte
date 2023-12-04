import { test } from '../../test';

export default test({
	html: `
		<div>
			<p></p>
		</div>
	`,

	test({ assert, target }) {
		const p = target.querySelector('p');

		assert.notEqual(p, undefined);
	}
});
