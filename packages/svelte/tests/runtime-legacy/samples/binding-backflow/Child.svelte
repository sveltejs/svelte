<script>
	export let testcase;
	export let value = { foo: 'kid' };
	if (testcase === 'init_update') {
		value = { foo: 'kid' }
	}
	if (testcase === 'init_mutate') {
		value.foo = 'kid'
	}
	$: if (testcase === 'reactive_update') {
		value = { foo: 'kid' }
	}
	$: if (testcase === 'reactive_mutate') {
		value.foo = 'kid'
	}
	export let updates = [];
	$: updates = [...updates, value];
</script>
  
<div>child: {value?.foo} | updates: {updates.length}</div>
