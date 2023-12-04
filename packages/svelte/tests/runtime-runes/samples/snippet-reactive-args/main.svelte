<script>
	import Inner from "./inner.svelte";

	let { log } = $props();

	let count = $state(0);
	let show_foo = $state(true);
	let snippet = $derived(show_foo ? foo : bar);
</script>

{#snippet foo({count})}
	<p>snippet: {count}</p>
{/snippet}

{#snippet bar(props)}
	<Inner {...props}></Inner>
{/snippet}

{@render snippet({ count, log })}

<button onclick={() => show_foo = !show_foo}>toggle</button>
<button onclick={() => count++}>increase count</button>
