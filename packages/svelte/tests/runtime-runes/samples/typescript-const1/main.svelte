<script lang="ts">
	const boxes = [ { width: 10, height: 10 }, { width: 20, height: 20 } ];
</script>

{#each boxes as box}
	{@const area: number = box.width * box.height}
	<p>{box.width} * {box.height} = {area}</p>
{/each}
