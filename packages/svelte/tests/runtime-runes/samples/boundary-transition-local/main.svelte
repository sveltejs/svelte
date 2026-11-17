<script>
	let { pending } = $props();
	let visible = $state(true);

	function fade() {
		return { duration: 100, css: (t) => `opacity: ${t}` };
	}

	function fail() {
		throw new Error('nope');
	}
</script>

<button onclick={() => visible = !visible}>toggle</button>

{#if visible}
	<svelte:boundary>
		<div transition:fade>static</div>
	</svelte:boundary>

	<svelte:boundary {pending}>
		<div transition:fade>dynamic</div>
	</svelte:boundary>

	<svelte:boundary>
		{fail()}
		{#snippet failed()}
			<div transition:fade>failed</div>
		{/snippet}
	</svelte:boundary>
{/if}
