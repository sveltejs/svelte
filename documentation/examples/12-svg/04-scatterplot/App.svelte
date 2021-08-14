<script>
	import Scatterplot from './Scatterplot.svelte';
	import data from './data.js';
</script>

<div class="chart">
	<h2>Anscombe's quartet</h2>

	<Scatterplot points={data.a}/>
	<Scatterplot points={data.b}/>
	<Scatterplot points={data.c}/>
	<Scatterplot points={data.d}/>
</div>

<style>
	.chart {
		width: 100%;
		max-width: 640px;
		height: calc(100% - 4em);
		min-height: 280px;
		max-height: 480px;
		margin: 0 auto;
	}
</style>