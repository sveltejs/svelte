import { test } from '../../test';

export default test({
	error: {
		code: 'conflicting-property-name',
		message: 'Cannot have a property and a component export with the same name'
	}
});
