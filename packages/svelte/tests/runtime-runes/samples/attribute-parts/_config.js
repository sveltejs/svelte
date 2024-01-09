import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<div class="123"></div><img src="12 hello, world 13">`
});
