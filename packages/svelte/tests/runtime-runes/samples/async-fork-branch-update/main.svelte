<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let count = $state(0);
	let doubled = $derived(count * 2);
	let f;
	let other;
</script>

<button onclick={() => (f = fork(() => (show = true)))}>preload</button>
<button onclick={() => count++}>increment</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => (show = true)}>reveal</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => (other = fork(() => (show = true)))}>preload second</button>
<button onclick={() => other.commit()}>commit second</button>
<button onclick={() => { show = false; count = 0; }}>reset</button>

{#if show}
	<p>{count} {doubled}</p>
{/if}
