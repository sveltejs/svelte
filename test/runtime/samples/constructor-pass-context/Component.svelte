<script>
	import { getContext } from 'svelte';

	const value = getContext('key');
	const fn = getContext('fn');
</script>

<div>{value}</div>
<button on:click={() => fn('hello world')} />