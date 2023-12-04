import { assert_ok, test } from '../../test';

export default test({
	snapshot(target) {
		const p = target.querySelector('p');
		assert_ok(p);

		return {
			p,
			span: p.querySelector('span'),
			code: p.querySelector('code')
		};
	}
});
