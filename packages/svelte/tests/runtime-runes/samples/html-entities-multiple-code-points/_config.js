import { test } from '../../test';

export default test({
	html: '<p title="\u2242\u0338">\u2242\u0338</p><p title="\u2242\u0338">\u2242\u0338</p>',
	test({ assert, target }) {
		for (const p of target.querySelectorAll('p')) {
			assert.equal(p.title, '\u2242\u0338');
			assert.equal(p.textContent, '\u2242\u0338');
		}
	}
});
