<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let target = $state(false);
	let disabled = $state(false);
</script>

<button onclick={() => fork(() => (target = true))}>fork</button>
<button onclick={() => (disabled = true)}>update</button>

{#if target}
	<Child label="a" {disabled} />
{/if}
