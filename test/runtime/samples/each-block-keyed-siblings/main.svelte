<script>
	export let ones;
	export let twos;
</script>

{#each ones as one (one.text)}
	<div>{one.text}</div>
{/each}

{#each twos as two (two.text)}
	<div>{two.text}</div>
{/each}