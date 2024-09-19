import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const should_be_false = /** @type {NodeListOf<HTMLDivElement>} */ (
			target.querySelectorAll('.translate-false div')
		);

		const should_be_true = /** @type {NodeListOf<HTMLDivElement>} */ (
			target.querySelectorAll('.translate-true div')
		);

		should_be_false.forEach((div, i) => {
			assert.equal(div.translate, false, `${i + 1} of ${should_be_false.length}: ${div.outerHTML}`);
		});

		should_be_true.forEach((div, i) => {
			assert.equal(div.translate, true, `${i + 1} of ${should_be_true.length}: ${div.outerHTML}`);
		});
	}
});
