<script>
	import { getContext, setContext } from 'svelte';

	let { label } = $props();
	let count = $state(0);

	console.log(getContext('parent'), getContext('field'));
	setContext('field', 'field');
</script>

<input />
{#if true}
	<button onclick={() => count++}>{label}: {count}</button>
{/if}
