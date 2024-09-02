<script>
	let no_need1;
	let no_need2;

	let does_need1;
	let does_need2;
	let does_need3 = $state();
</script>

{typeof does_need1}
{typeof does_need2}
{typeof does_need3}

<div bind:this={does_need1}></div>

{#if true}
	<div bind:this={no_need1}></div>
	<div bind:this={no_need2}></div>
	<div bind:this={does_need2}></div>
	<div bind:this={does_need3}></div>
{/if}

<button onclick={() => console.log(no_need2)}>foo</button>
