import { assert_ok, test } from '../../test';

export default test({
	snapshot(target) {
		const ul = target.querySelector('ul');
		assert_ok(ul);
		const lis = ul.querySelector('li');
		assert_ok(lis);

		return {
			ul,
			lis
		};
	}
});
