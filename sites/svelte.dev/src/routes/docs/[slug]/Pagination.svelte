
<script>
	import { page } from '$app/stores';

	export let pages;

	$: index = pages.findIndex(({ path }) => path === $page.url.pathname);
	$: prev = pages[index - 1];
	$: next = pages[index + 1];
</script>

<div class="controls">
	<div>
		<span class:faded={!prev}>previous</span>

		{#if prev}
			<a href={prev.path}>{prev.title}</a>
		{/if}
	</div>

	<div>
		<span class:faded={!next}>next</span>
		{#if next}
			<a href={next.path}>{next.title}</a>
		{/if}
	</div>
</div>

<style>
	.controls {
		max-width: calc(var(--sk-line-max-width) + 1rem);
		border-top: 1px solid var(--sk-back-4);
		padding: 1rem 0 0 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 6rem 0 0 0;
	}

	.controls > :first-child {
		text-align: left;
	}

	.controls > :last-child {
		text-align: right;
	}

	.controls span {
		display: block;
		font-size: 1.2rem;
		text-transform: uppercase;
		font-weight: 600;
		color: var(--sk-text-3);
	}

	.controls span.faded {
		opacity: 0.4;
	}
</style>
