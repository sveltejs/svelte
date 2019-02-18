<script>
	import Counter from './Counter.svelte';

	export let x;
</script>

<Counter bind:count={x}/>
<p>count: {x}</p>