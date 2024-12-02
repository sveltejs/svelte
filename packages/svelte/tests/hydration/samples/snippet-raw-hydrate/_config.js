import { test } from '../../test';

export default test({
	snapshot(target) {
		return {
			p: target.querySelector('p')
		};
	}
});
