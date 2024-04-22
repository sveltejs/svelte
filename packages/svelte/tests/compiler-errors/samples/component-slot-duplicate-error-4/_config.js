import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_default_slot_content',
		message: 'Found default slot content alongside an explicit slot="default"'
	}
});
