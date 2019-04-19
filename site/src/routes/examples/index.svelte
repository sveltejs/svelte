<script context="module">
	export async function preload() {
		const groups = await this.fetch(`examples.json`).then(r => r.json());

		return {
			groups
		};
	}
</script>

<script>
	export let groups;
</script>

<style>
	.content {
		max-width: 120rem;
		padding: 0 var(--side-nav);
		margin: 0 auto;
	}

	h1 { margin: 6rem 0 6rem -0.05em }

	h2 {
		margin: 0 0 1em 0;
		font: 600 var(--h6) var(--font);
		border-bottom: var(--border-w) solid #eee;
		text-transform: uppercase;
		letter-spacing: .05em;
		padding: 0 0 0.5em 0;
	}

	section { margin: 0 0 4rem 0 }

	.example {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
		font: 300 var(--h6) var(--font);
	}

	.thumbnail {
		position: relative;
		background: white 50% 50% no-repeat;
		background-size: contain;
		width: 5rem;
		height: 5rem;
		margin: .8rem 33%;
		border: 1px solid #ccc;
		border-radius: var(--border-r);
		box-shadow: 1px 1px 2px rgba(0,0,0,0.13);
	}

	.e-grid {
		display: grid;
		/* grid-gap: 2.4rem; */
		grid-template-columns: repeat(2, 1fr);
		align-items: center;
	}

	@media (min-width: 720px) {
		.e-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 1080px) {
		.e-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>

<div class="content">
	<h1>Examples</h1>

	{#each groups as group}
		<section class="">
			<h2>{group.title}</h2>

			<div class="e-grid">
				{#each group.examples as example}
					<a class="example" href="repl?example={example.slug}">
						<div class="thumbnail" style="background-image: url(examples/thumbnails/{example.slug}.png)"></div>
						<p>{example.title}</p>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>