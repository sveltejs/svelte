<script>
	export let data;
</script>

<svelte:head>
	<title>Examples • Svelte</title>
</svelte:head>

<div class="examples">
	<h1>Examples</h1>

	{#each data.examples as section}
		<h2>{section.title}</h2>

		<ul>
			{#each section.examples as example}
				<li>
					<a href="/repl/{example.slug}">
						<img src="/examples/thumbnails/{example.slug}.jpg" alt="{example.title} thumbnail" />
						{example.title}
					</a>
				</li>
			{/each}
		</ul>
	{/each}
</div>

<style>
	.examples {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-main-width);
		margin: 0 auto;
	}

	h1 {
		font-size: 4rem;
		font-weight: 400;
	}

	ul {
		list-style: none;
		display: grid;
		grid-gap: 1rem;
	}

	li {
		position: relative;
	}

	h2 {
		color: var(--sk-text-2);
		font-size: var(--sk-text-l);
		font-weight: 400;
		margin-top: 2em;
	}

	li a {
		display: flex;
		align-items: center;
		gap: 1rem;
		border-radius: var(--sk-border-radius);
		color: var(--sk-text-2);
		text-decoration: none;
		/* border: 1px solid #eee; */
		border-radius: 4px;
		padding: 1rem;
		background: white;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}

	li a:hover {
		text-decoration: underline;
	}

	li img {
		width: 6rem;
		aspect-ratio: 1;
		/* background: white; */
		object-fit: contain;
	}

	@media (min-width: 540px) {
		ul {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 720px) {
		ul {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
