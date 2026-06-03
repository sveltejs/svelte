<script>
	import { setContext, getContext } from 'svelte';

	setContext('key', 'child value');
	await Promise.resolve();
</script>

<div>{getContext('key')}</div>
