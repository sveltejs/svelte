<script>
	import { getContext, setContext } from 'svelte';
	import Child from './Child.svelte';

	setContext('key', 'value');
	await Promise.resolve();
</script>

<div>{getContext('key')}</div>
<div>{(await Promise.resolve(true)) && getContext('key')}</div>
<Child />
