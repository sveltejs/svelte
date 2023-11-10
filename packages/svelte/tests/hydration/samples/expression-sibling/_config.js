import { assert_ok, test } from '../../test';

export default test({
	snapshot(target) {
		const p = target.querySelector('p');
		assert_ok(p);

		return {
			p,
			text: p.childNodes[0],
			span: p.querySelector('span')
		};
	}
});
