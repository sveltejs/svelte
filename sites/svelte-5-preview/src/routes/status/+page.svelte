<script>
	export let data;
</script>

<div class="status">
	<div class="column">
		<h1>Is Svelte 5 ready yet?</h1>

		<h2>{data.results.passed === data.results.total ? `Yes! 🎉` : `No.`}</h2>

		<p class="details">
			{data.results.total} tests ({data.results.suites.length} suites) – {data.results.passed} passed,
			{data.results.failed}
			failed, {data.results.skipped} skipped.
			<a href="/coverage/index.html">See coverage report.</a>
		</p>
	</div>

	<div class="results">
		{#each data.results.suites as suite}
			<section>
				<h3>{suite.name}</h3>
				<div class="grid">
					{#each suite.tests as test}
						<div title={test.title} class="result {test.status}"></div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>

<style>
	.status {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
	}

	.column {
		max-width: var(--sk-page-main-width);
		margin: 0 auto;
	}

	h2 {
		font-size: 10rem;
		line-height: 1;
		margin: 2rem 0 0 0;
		left: -0.05em;
		color: var(--sk-theme-2);
	}

	.details {
		color: var(--sk-text-4);
		margin: 0;
	}

	section {
		margin: 2rem 0;
	}

	h3 {
		margin: 0 0 0.5rem 0;
	}
	.grid {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.result {
		width: 1.2rem;
		height: 1.2rem;
		background: #eee;
	}

	.result.skipped {
		background: rgb(236 236 236);
	}

	.result.passed {
		background: rgb(149 236 83);
	}

	.result.failed {
		background: rgb(236 83 83);
	}
</style>
