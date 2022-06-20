<script>
	import Counter from './Counter.svelte';

	export let x = 10;
</script>

<Counter bind:count={x}/>
<p>count: {x}</p>