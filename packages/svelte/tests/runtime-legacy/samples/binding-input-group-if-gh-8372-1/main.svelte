<script>
	export let test = [];
	let hidden = false
</script>

<button on:click={() => hidden = !hidden}>
	{hidden ? "show" : "hide"} b
</button>

<label>a <input type="checkbox" bind:group={test} value="a" /></label>
{#if !hidden}
	<label>b <input type="checkbox" bind:group={test} value="b" /></label>
{/if}
<label>c{hidden ? "show" : "hide"} b <input value="just here, so b is not the last input" /></label>
