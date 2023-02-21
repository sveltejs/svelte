<script>
	export let boxes;
</script>

{#if boxes.length === 2}
	{@const box1 = boxes[0]}
	{@const box2 = boxes[1]}
	{@const { width, height } = box1}
	<div>{width} x {height}</div>
	<div>{box2.width} x {box2.height}</div>
{:else if boxes.length === 1}
	{@const box = boxes[0]}
	{@const { width, height } = box}
	<div>{width} x {height}</div>
{:else}
	{@const length = boxes.length}
	<div>{length}</div>
{/if}
