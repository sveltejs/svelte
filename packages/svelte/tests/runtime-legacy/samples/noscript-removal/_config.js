import { test } from '../../test';

export default test({
	test({ assert, target, variant }) {
		// if created on client side, should not build noscript
		if (variant === 'dom') {
			assert.equal(target.querySelectorAll('noscript').length, 0);
			assert.htmlEqual(
				target.innerHTML,
				`
					<div>foo</div>
					<div>foo<div>foo</div></div>
				`
			);
		} else {
			assert.equal(target.querySelectorAll('noscript').length, 3);
			assert.htmlEqual(
				target.innerHTML,
				`
					<noscript>foo</noscript>
					<div>foo<noscript>foo</noscript></div>
					<div>foo<div>foo<noscript>foo</noscript></div></div>
				`
			);
		}
	}
});
