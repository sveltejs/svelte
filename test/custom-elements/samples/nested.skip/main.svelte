<svelte:options tag="my-app"/>

<script>
	import Counter from './Counter.svelte';

	export let count;
</script>

<Counter bind:count/>
<p>clicked {count} times</p>
