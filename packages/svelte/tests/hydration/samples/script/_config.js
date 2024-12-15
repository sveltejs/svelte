import { test } from '../../test';

export default test({
	snapshot(target) {
		const script = target.querySelector('script');

		return {
			script
		};
	}
});
