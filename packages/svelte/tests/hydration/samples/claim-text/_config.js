import { test } from '../../test';

export default test({
	snapshot(target) {
		return {
			main: target.querySelector('main'),
			p: target.querySelector('p')
		};
	}
});
