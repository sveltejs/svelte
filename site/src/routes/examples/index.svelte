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
		max-width: 80rem;
		margin: 0 auto;
	}

	h1 {
		margin: 4rem 0 4rem -0.05em;
		font-size: 5.4rem;
	}

	h2 {
		margin: 0 0 1em 0;
		font-size: 18px;
		border-bottom: 1px solid #eee;
		text-transform: uppercase;
		padding: 0 0 0.5em 0;
	}

	section {
		margin: 0 0 2em 0;
	}

	.example {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0 0 0 85px;
		min-height: 50px;
		font-weight: 300;
	}

	.grid {
		grid-template-columns: repeat(1, 1fr);
		grid-gap: 0.5em;
	}

	@media (min-width: 720px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.thumbnail {
		position: absolute;
		background: white 50% 50% no-repeat;
		background-size: contain;
		width: 75px;
		height: 50px;
		left: 0;
		top: 0;
		border: 1px solid #ccc;
		border-radius: 2px;
		box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
	}

	/* .thumbnail::before {
		content: "";
		width: 1px;
		margin-left: -1px;
		float: left;
		height: 0;
		padding-top: 100%;
	}

	.thumbnail::after {
		content: "";
		display: table;
		clear: both;
	} */

	img {
		background-color: #eee;
	}
</style>

<div class="content">
	<h1>Examples</h1>

	{#each groups as group}
		<section>
			<h2>{group.title}</h2>

			<div class="grid">
				{#each group.examples as example}
					<a class="example" href="repl?example={example.slug}">
						<div class="thumbnail" style="background-image: url(examples/thumbnails/{example.slug}.png)"></div>
						<span>{example.title}</span>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>