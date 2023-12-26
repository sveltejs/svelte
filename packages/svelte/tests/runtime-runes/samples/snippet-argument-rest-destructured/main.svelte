<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
	let tripled = $derived(count * 3);
</script>

{#snippet foo(n: number, ...[doubled, { tripled }]: number[])}
	<p>clicks: {n}, doubled: {doubled}, tripled: {tripled}</p>
{/snippet}

{@render foo(count, doubled, {tripled})}

<button on:click={() => count += 1}>
	click me
</button>
