<script>
	import Scatterplot from './Scatterplot.svelte';

	export let a;
	export let b;
	export let c;
	export let d;
</script>

<div class="chart">
	<h2>Anscombe's quartet</h2>

	<Scatterplot points={a}/>
	<Scatterplot points={b}/>
	<Scatterplot points={c}/>
	<Scatterplot points={d}/>
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