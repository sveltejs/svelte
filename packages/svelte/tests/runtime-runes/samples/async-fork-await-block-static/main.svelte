<script lang="ts">
	import { fork, type Fork } from 'svelte';

	let show = $state(false);
	let x = $state(0);
	let f: Fork;

	const d = Promise.withResolvers();
</script>

<button onclick={() => f = fork(() => { show = true; x = 1 })}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => d.resolve(5)}>resolve(5)</button>
<button onclick={() => f?.discard()}>discard</button>

<div id="output">
	{#if show}{#await d.promise}<i>pending</i>{:then v}<q>{v}</q>{/await}{/if}<p>{x}</p>
</div>
