<script>
	import { onMount } from 'svelte';

	export let sections = [];
	export let active_section = null;
	export let isLoading = false;

	let active_el;

	onMount(() => {
		active_el.scrollIntoView({ block: 'center' });
	});
</script>

<ul class="examples-toc">
	{#each sections as section}
		<!-- Avoid embeds -->
		{#if section.title !== 'Embeds'}
			<li>
				<span class="section-title">{section.title}</span>

				{#each section.examples as example}
					<div class="row" class:active={example.slug === active_section} class:loading={isLoading}>
						<a
							href="/examples/{example.slug}"
							class="row"
							class:active={example.slug === active_section}
							class:loading={isLoading}
						>
							<img
								class="thumbnail"
								alt="{example.title} thumbnail"
								src="/examples/thumbnails/{example.slug}.jpg"
							/>

							<span>{example.title}</span>
						</a>
						{#if example.slug === active_section}
							<a bind:this={active_el} href="/repl/{example.slug}" class="repl-link">REPL</a>
						{/if}
					</div>
				{/each}
			</li>
		{/if}
	{/each}
</ul>

<style>
	.examples-toc {
		overflow-y: auto;
		height: 100%;
		border-right: 1px solid var(--sk-back-4);
		background-color: var(--sk-back-3);
		color: var(--sk-text-2);
		padding: 3rem 3rem 0 3rem;
		margin: 0;
	}

	.examples-toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 4.8rem 0;
	}

	.section-title {
		display: block;
		padding: 0 0 0.8rem 0;
		font: 400 var(--sk-text-xs) var(--sk-font);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-weight: 700;
	}

	div {
		display: flex;
		flex-direction: row;
		padding: 0.2rem 3rem;
		margin: 0 -3rem;
	}

	div.active {
		color: white;
	}

	div.active.loading {
		background: rgba(0, 0, 0, 0.1) calc(100% - 3rem) 47% no-repeat url(/icons/loading.svg);
		background-size: 1em 1em;
		color: white;
	}

	a {
		display: flex;
		flex: 1 1 auto;
		position: relative;
		color: var(--sk-text-2);
		border-bottom: none;
		font-size: 1.6rem;
		align-items: center;
		justify-content: start;
		padding: 0;
	}

	a:hover {
		color: var(--sk-text-1);
	}

	.repl-link {
		flex: 0 1 auto;
		font-size: 1.2rem;
		font-weight: 700;
		margin-right: 2.5rem;
	}

	.thumbnail {
		background-color: #fff;
		object-fit: contain;
		width: 5rem;
		height: 5rem;
		border-radius: 2px;
		box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.13);
		margin: 0.2em 0.5em 0.2em 0;
	}
</style>
