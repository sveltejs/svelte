<script lang="ts">
	const boxes = [ { width: 10, height: 10 }, { width: 20, height: 20 } ];
</script>

{#each boxes as box}
	{@const area: number = box.width * box.height}
	{@const name: string = "{}"}
	<p>{box.width} * {box.height} = {area}</p>
	<p>{name}</p>
{/each}
