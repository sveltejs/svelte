import { assert_ok, test } from '../../test';

export default test({
	props: {
		things: {
			foo: ['animal', 'vegetable', 'mineral']
		}
	},

	snapshot(target) {
		const ul = target.querySelector('ul');
		assert_ok(ul);
		const lis = ul.querySelectorAll('li');

		return {
			ul,
			lis0: lis[0],
			lis1: lis[1],
			lis2: lis[2]
		};
	}
});
