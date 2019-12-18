<script>
	export let sections = [];
	export let active_section = null;
	export let isLoading = false;
</script>

<style>
	.examples-toc {
		overflow-y: auto;
		height: 100%;
		border-right: 1px solid var(--second);
		background-color: var(--second);
		color: white;
		padding: 3rem 3rem 0 3rem;
	}

	.examples-toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 4.8rem 0;
	}

	.section-title {
		display: block;
		padding: 0 0 0.8rem 0;
		font: 400 var(--h6) var(--font);
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
		background: rgba(0, 0, 0, 0.15) calc(100% - 3rem) 47% no-repeat
			url(/icons/arrow-right.svg);
		background-size: 1em 1em;
		color: white;
	}

	div.active.loading {
		background: rgba(0, 0, 0, 0.1) calc(100% - 3rem) 47% no-repeat
			url(/icons/loading.svg);
		background-size: 1em 1em;
		color: white;
	}

	a {
		display: flex;
		flex: 1 1 auto;
		position: relative;
		color: var(--sidebar-text);
		border-bottom: none;
		font-size: 1.6rem;
		align-items: center;
		justify-content: start;
	}

	a:hover {
		color: white;
	}

	.repl-link {
		flex: 0 1 auto;
		font-size: 1.2rem;
		font-weight: 700;
		margin-right: 2.5rem;
	}

	.thumbnail {
		background-color: white;
		object-fit: contain;
		width: 5rem;
		height: 5rem;
		border-radius: 2px;
		box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.13);
		margin: 0.2em 0.5em 0.2em 0;
	}
</style>

<ul class="examples-toc">
	{#each sections as section}
		<li>
			<span class="section-title">{section.title}</span>

			{#each section.examples as example}
				<div
					class="row"
					class:active={example.slug === active_section}
					class:loading={isLoading}>
					<a
						href="examples#{example.slug}"
						class="row"
						class:active={example.slug === active_section}
						class:loading={isLoading}>
						<img
							class="thumbnail"
							alt="{example.title} thumbnail"
							src="examples/thumbnails/{example.slug}.jpg" />

						<span>{example.title}</span>
					</a>
					{#if example.slug === active_section}
						<a href="repl/{example.slug}" class="repl-link">REPL</a>
					{/if}
				</div>
			{/each}
		</li>
	{/each}
</ul>
