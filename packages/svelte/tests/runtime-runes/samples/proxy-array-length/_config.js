import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent',
	html: `
		<input><input><input><div>3</div>
	`
});
