import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '012',
	ssrHtml: '012'
});
