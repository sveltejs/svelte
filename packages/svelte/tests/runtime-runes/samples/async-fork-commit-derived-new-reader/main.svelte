<script>
	import { fork } from 'svelte';

	let s1 = $state(0);
	let show = $state(false);
	let d2 = $derived(s1 * 2);
	let f;
</script>

<button onclick={() => (f = fork(() => (s1 = 1)))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => f.commit()}>commit</button>

{#if d2 === 2}<span>two</span>{/if}
{#if show}
	<p>{d2}</p>
{/if}
