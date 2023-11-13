import { test } from '../../test';

export default test({
	skip: true,
	error: {
		code: '',
		message:
			'Stores must be declared at the top level of the component (this may change in a future version of Svelte)'
	}
});
