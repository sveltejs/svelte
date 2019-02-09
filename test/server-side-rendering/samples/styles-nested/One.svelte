<script>
	import Two from './Two.svelte';

	export let message;
</script>

<div>green: {message}</div>

<!-- Two styles should *not* be included -->
<!-- <Two {message}/> -->

<style>
	div {
		color: green;
	}
</style>
