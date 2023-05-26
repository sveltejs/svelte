<script>
	export let boxes;
</script>

{#if boxes.length > 0}
	{@const box = boxes[0]}
	{@const { width, height } = box}
	<div>{width} x {height}</div>
{/if}
