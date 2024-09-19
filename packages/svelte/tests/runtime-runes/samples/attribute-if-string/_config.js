import { test } from '../../test';

export default test({
	test({ assert, target, variant, hydrate }) {
		function check(/** @type {boolean} */ condition) {
			const divs = /** @type {NodeListOf<HTMLDivElement>} */ (
				target.querySelectorAll(`.translate-${condition} div`)
			);

			divs.forEach((div, i) => {
				assert.equal(div.translate, condition, `${i + 1} of ${divs.length}: ${div.outerHTML}`);
			});
		}

		check(false);
		check(true);

		if (variant === 'hydrate') {
			hydrate();
			check(false);
			check(true);
		}
	}
});
