<script lang="ts">
	let items: { a?: string; b?: number }[][] = [];
</script>

{#each items as row: { a?: string; b?: number }[], i (i)}
	{@const first: { a?: string } = row[0]}
	<p>{first.a}</p>
{/each}
