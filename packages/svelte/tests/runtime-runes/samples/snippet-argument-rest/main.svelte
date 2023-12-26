<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
	let tripled = $derived(count * 3);
</script>

{#snippet foo(n: number, ...rest: number[])}
	<p>clicks: {n}, doubled: {rest[0]}, tripled: {rest[1]}</p>
{/snippet}

{@render foo(count, doubled, tripled)}

<button on:click={() => count += 1}>
	click me
</button>
