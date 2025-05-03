<script>
	const log = () => {
		if (!snip) throw new Error('oops');
	}
	let x = $state(0);
</script>

<button onclick={log}></button>

{#snippet snip()}
	snippet {x}
{/snippet}
