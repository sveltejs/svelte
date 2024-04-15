<script>
	import Counter from './Counter.svelte';

	/** @type {{ object: { count: number }}} */
	let { object } = $props();
</script>

<Counter bind:object={object} />
