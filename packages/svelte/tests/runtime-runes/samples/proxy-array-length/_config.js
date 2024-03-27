import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	html: `
		<input><input><input><div>3</div>
	`
});
