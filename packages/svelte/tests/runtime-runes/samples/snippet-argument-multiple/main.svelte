<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

{#snippet foo(n: number, doubled: number)}
	<p>clicks: {n}, doubled: {doubled}</p>
{/snippet}

{@render foo(count, doubled)}

<button on:click={() => count += 1}>
	click me
</button>
