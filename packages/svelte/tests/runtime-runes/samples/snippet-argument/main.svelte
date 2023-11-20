<script lang="ts">
	let count = $state(0);
</script>

{#snippet foo(n: number)}
	<p>clicks: {n}</p>
{/snippet}

{@render foo(count)}

<button on:click={() => count += 1}>
	click me
</button>
