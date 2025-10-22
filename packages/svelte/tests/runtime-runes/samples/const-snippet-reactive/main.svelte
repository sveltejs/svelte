<script>
	import Component from "./Component.svelte";
	let count = $state(0);
</script>

{#snippet snip()}
<p>snip</p>
{/snippet}

<button onclick={() => count++}></button>
{#if true}
	{@const test =  count % 2 === 0 ? undefined: snip}
	<Component {test} />
{/if}

