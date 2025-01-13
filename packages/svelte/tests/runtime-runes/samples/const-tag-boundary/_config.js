import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button></button> 2',
	mode: ['client']
	// TODO fix reactivity lost in failed snippet and add a test here
});
