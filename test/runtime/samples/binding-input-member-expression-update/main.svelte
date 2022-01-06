<script>
	export let values = { a: 'abc', b: 'def' };
	export let paths = ['a'];
	export let logs = [];

	$: paths && logs.push('paths updated');
</script>

<input bind:value={values[paths[0]]} />
