<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';

	class Person {
		name = $state({
			first: 'Mr',
			last: 'Bean'
		});
	}

	setContext('foo', {
		person: new Person()
	});
</script>

<Child />
