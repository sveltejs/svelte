import { test } from '../../test';

export default test({
	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div,
			p: div?.querySelector('p')
		};
	}
});
