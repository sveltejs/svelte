<script>
	export let test;
	let hidden = false
</script>

<button on:click={() => hidden = !hidden}>
	{hidden ? "show" : "hide"} b
</button>

<label>a <input type="radio" bind:group={test} value="a" /></label>
{#if !hidden}
<label>b <input type="radio" bind:group={test} value="b" /></label>
{/if}
<label>c <input value="just here, so b is not the last input" /></label>
