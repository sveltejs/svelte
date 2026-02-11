<script lang="ts">
	let count = $state(1);
	async function getDouble(count: number) {
		return count * 2;
	}
	const double = $derived(await getDouble(count));
</script>

Count: {count}

{#snippet ssr(num: number)}
	{num}
{/snippet}

Double: {@render ssr(double)}
