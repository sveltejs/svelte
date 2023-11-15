import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-default-slot-content',
		message: 'Found default slot content alongside an explicit slot="default"'
	}
});
