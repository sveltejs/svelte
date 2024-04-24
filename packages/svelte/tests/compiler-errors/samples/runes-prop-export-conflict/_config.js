import { test } from '../../test';

export default test({
	error: {
		code: 'conflicting_property_name',
		message: 'Cannot have a property and a component export with the same name'
	}
});
