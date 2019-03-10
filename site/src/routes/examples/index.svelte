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

	.grid {
		grid-template-columns: repeat(1, 1fr);
	}

	@media (min-width: 480px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 720px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1080px) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.thumbnail {
		background: #eee;
	}

	.thumbnail::before {
		content: "";
		width: 1px;
		margin-left: -1px;
		float: left;
		height: 0;
		padding-top: 66.666%;
	}

	.thumbnail::after { /* to clear float */
		content: "";
		display: table;
		clear: both;
	}

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
					<a href="repl?example={example.slug}">
						<figure>
							<div class="thumbnail"></div>
							<!-- <img alt="'{example.title}' screenshot" width="150" height="100" src=""> -->
							<figcaption>{example.title}</figcaption>
						</figure>
					</a>
				{/each}
			</div>

		</section>
	{/each}
</div>