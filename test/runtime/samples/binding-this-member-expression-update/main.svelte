<script>
	export let container = {};
	export let paths = ['a'];
	export let logs = [];

	$: paths && logs.push('paths updated');
</script>

<div bind:this={container[paths[0]]} />
