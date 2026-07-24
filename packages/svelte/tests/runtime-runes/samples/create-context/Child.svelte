<script>
	import { get, has } from './main.svelte';

	const message = get();
</script>

<h1>{message}</h1>
{#if has()}
	<h2>it's me</h2>
{/if}
