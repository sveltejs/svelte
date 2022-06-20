<script>
	import Counter from './Counter.svelte';

	let x;
</script>

<Counter bind:count={x}/>
<p>count: {x}</p>