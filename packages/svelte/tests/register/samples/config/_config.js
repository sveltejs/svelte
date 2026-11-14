import { test } from '../../test';

export default test({
	warnings: ['`svelte/register` does not support preprocessors'],
	expected: {
		head: '',
		css: '\n\tp.svelte-n50uah { color: red; }\n'
	}
});
