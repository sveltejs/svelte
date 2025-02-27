import { test } from '../../test';

export default test({
	test(assert, target) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<main>
				<p>s1</p>
				<p id="s2">s2</p>
				<p data-uid="s3-main">s3</p>
				Text <p id="s4">s4</p>
			</main>
			`
		);
	}
});
