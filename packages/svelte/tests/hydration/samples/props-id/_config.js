import { test } from '../../test';

export default test({
	test(assert, target) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<main>
				Text first
				<p>s1</p>
				<p>s2</p>
				<p>s3</p>
			</main>
			`
		);
	}
});
