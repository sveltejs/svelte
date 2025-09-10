<script lang="ts">
	let should_throw = $state(false);

	function throw_error() {
		throw new Error('oops');
	}
</script>

<button onclick={() => should_throw = true}>
	throw
</button>

<svelte:boundary>
	<p>some content</p>

	{#if should_throw}
		{throw_error()}
	{/if}
</svelte:boundary>
