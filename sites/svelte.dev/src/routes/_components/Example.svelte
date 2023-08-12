<script>
	import IntersectionObserver from '$lib/components/IntersectionObserver.svelte';
	import ReplWidget from '$lib/components/ReplWidget.svelte';

	export let id;
</script>

<div class="repl-container">
	<IntersectionObserver once let:intersecting top={400}>
		{#if intersecting}
			<ReplWidget example={id} />
		{/if}
	</IntersectionObserver>
</div>

<style>
	.repl-container {
		width: 100%;
		height: 420px;
		border-radius: var(--sk-border-radius);
		overflow: hidden;
	}
</style>
