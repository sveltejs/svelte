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

	a {
		display: flex;
		position: relative;
		color: var(--sidebar-text);
		border-bottom: none;
		padding: 0.2rem 3rem;
		margin: 0 -3rem;
		font-size: 1.6rem;
		align-items: center;
		justify-content: start;
	}

	a:hover {
		color: white;
	}

	a.active {
		background: rgba(0, 0, 0, 0.15) calc(100% - 3rem) 50% no-repeat
			url(/icons/arrow-right.svg);
		background-size: 1em 1em;
		color: white;
	}

	a.active.loading {
		background: rgba(0, 0, 0, 0.1) calc(100% - 3rem) 50% no-repeat
			url(/icons/loading.svg);
		background-size: 1em 1em;
		color: white;
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
		<span class="section-title">
			{section.title}
		</span>

		{#each section.examples as example}
		<a
			href="examples#{example.slug}"
			class="row"
			class:active="{example.slug === active_section}"
			class:loading="{isLoading}"
		>
			<img
				class="thumbnail"
				alt="{example.title} thumbnail"
				src="examples/thumbnails/{example.slug}.jpg"
			/>

			<span>{example.title}</span>
		</a>
		{/each}
	</li>
	{/each}
</ul>
