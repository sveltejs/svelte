<script>
	let slide = 0;
	let num = false;
	
	const changeNum = () => num = !num;
</script>

<section>
	{#key slide}
		{#if num}
			<div>First</div>
		{/if}
	{/key}
	<div>Second</div>
</section>

<button on:click={changeNum}>Click</button>