import { test } from '../../test';

export default test({
	error: {
		code: 'slot_default_duplicate',
		message: 'Found default slot content alongside an explicit slot="default"'
	}
});
