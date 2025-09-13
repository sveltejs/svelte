import { test } from '../../test';

export default test({
	mode: ['server'],

	error: 'Encountered an asynchronous component while rendering synchronously'
});
