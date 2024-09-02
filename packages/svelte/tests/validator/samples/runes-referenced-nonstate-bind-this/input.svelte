<script>
	let no_need_no_conditional;

	let no_need_no_read1;
	let no_need_no_read2;

	let does_need1;
	let does_need2 = $state();
</script>

{typeof no_need_no_conditional}
{typeof does_need1}
{typeof does_need2}

<div bind:this={no_need_no_conditional}></div>

{#if true}
	<div bind:this={no_need_no_read1}></div>
	<div bind:this={no_need_no_read2}></div>
	<div bind:this={does_need1}></div>
	<div bind:this={does_need2}></div>
{/if}

<button onclick={() => console.log(no_need_no_read2)}>foo</button>
