<script>
	export let boxes;
</script>

{#if boxes.length > 1}
	{@const box1 = boxes[0]}
	{@const box2 = boxes[1]}
	{@const { width, height } = box1}
	<div>{width} x {height}</div>
	<div>{box2.width} x {box2.height}</div>
{:else if boxes.length > 0}
	{@const box = boxes[0]}
	{@const { width, height } = box}
	<div>{width} x {height}</div>
{/if}

{#if boxes.length > 1}
	<div>{boxes[0].width} x {boxes[0].height}</div>
	<div>{boxes[1].width} x {boxes[1].height}</div>
{:else if boxes.length > 0}
	{@const box = boxes[0]}
	{@const { width, height } = box}
	<div>{width} x {height}</div>
{/if}