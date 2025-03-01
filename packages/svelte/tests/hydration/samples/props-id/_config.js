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
				<p id="x">s5</p>
				<p id="s6">s6</p>
				<div id="s7">s7</div>
			</main>
			`
		);
	}
});
