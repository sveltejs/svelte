<script>
	const log = () => {
		console.log(snip);
	}
	let x = $state(0);
</script>

<button onclick={log}></button>

{#snippet snip()}
	snippet {x}
{/snippet}