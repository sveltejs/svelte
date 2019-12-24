<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title;
	export let slug;
	export let query;

	function highlightQuery(text, query) {
		return text.replace(query, `<span class="site-search-highlight">${query}</span>`)
			.replace(/</g, `&lt;`)
			.replace(/>/g, `&gt;`)
			.replace(/&lt;span class="site-search-highlight"&gt;/g, `<span class="site-search-highlight">`)
			.replace(/&lt;\/span&gt;/g, `</span>`);
	}
</script>

<svelte:head>
	<style>
		.site-search-highlight {
			background: rgba(0, 0, 0, 0.3);
		}
	</style>
</svelte:head>

<a href="/docs#{slug}" on:click={()=> dispatch('navigate')}>
	<div class="result">
		<div class="inner">
			{@html highlightQuery(title, query)}
		</div>
	</div>
</a>

<style>
	.result {
		padding: 6px 12px;
		color: var(--text);
		transition: opacity 300ms;
		opacity: 0.8;
	}
	.result:hover {
		opacity: 1;
	}
	.inner {
		border-radius: var(--border-r);
		border: calc(var(--border-w) / 2) solid var(--second);
		padding: 8px;
	}
</style>
