<script>
	import { createEventDispatcher } from 'svelte';

	/** @type {import('./types').Tree[]} */
	export let results;

	/** @type {string} */
	export let query;

	const dispatch = createEventDispatcher();

	/** @param {string} text */
	function escape(text) {
		return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replaceAll('`', '');
	}

	/**
	 * @param {string} content
	 * @param {string} query
	 */
	function excerpt(content, query) {
		if (content === null) return '';

		const index = content.toLowerCase().indexOf(query.toLowerCase());
		if (index === -1) {
			return escape(content.slice(0, 100));
		}

		const prefix = index > 20 ? `…${content.slice(index - 15, index)}` : content.slice(0, index);
		const suffix = content.slice(
			index + query.length,
			index + query.length + (80 - (prefix.length + query.length))
		);

		return (
			escape(prefix) +
			`<mark>${escape(content.slice(index, index + query.length))}</mark>` +
			escape(suffix)
		);
	}
</script>

<ul>
	{#each results as result (result.href)}
		<li>
			<a
				data-sveltekit-preload-data
				href={result.href}
				on:click={() => dispatch('select', { href: result.href })}
				data-has-node={result.node ? true : undefined}
			>
				<strong>{@html excerpt(result.breadcrumbs[result.breadcrumbs.length - 1], query)}</strong>

				{#if result.node?.content}
					<span>{@html excerpt(result.node.content, query)}</span>
				{/if}
			</a>

			{#if result.children.length > 0}
				<svelte:self results={result.children} {query} on:select />
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		position: relative;
		margin: 0;
	}

	ul :global(ul) {
		margin-left: 0.8em !important;
		padding-left: 0em;
		border-left: 1px solid var(--sk-back-5);
	}

	li {
		list-style: none;
		margin-bottom: 1em;
	}

	li:last-child {
		margin-bottom: 0;
	}

	ul ul li {
		margin: 0;
	}

	a {
		display: block;
		text-decoration: none;
		line-height: 1;
		padding: 1rem;
	}

	a:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	a:focus {
		background: var(--sk-theme-2);
		color: white;
		outline: none;
	}

	a strong,
	a span {
		display: block;
		white-space: nowrap;
		line-height: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	a strong {
		font-size: 1.6rem;
		color: var(--sk-text-2);
	}

	a span {
		font-size: 1.2rem;
		color: #737373;
		margin: 0.4rem 0 0 0;
	}

	a :global(mark) {
		--highlight-color: rgba(255, 255, 0, 0.2);
	}

	a span :global(mark) {
		background: none;
		color: var(--sk-text-1);
		background: var(--highlight-color);
		outline: 2px solid var(--highlight-color);
		border-top: 2px solid var(--highlight-color);
		/* mix-blend-mode: darken; */
	}

	a:focus span {
		color: rgba(255, 255, 255, 0.6);
	}

	a:focus strong {
		color: white;
	}

	a:focus span :global(mark),
	a:focus strong :global(mark) {
		--highlight-color: hsl(240, 8%, 54%);
		mix-blend-mode: lighten;
		color: white;
	}

	a strong :global(mark) {
		color: var(--sk-text-1);
		background: var(--highlight-color);
		outline: 2px solid var(--highlight-color);
		/* border-top: 2px solid var(--highlight-color); */
		border-radius: 1px;
	}
</style>
