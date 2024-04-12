<script lang="ts">
	import { setContext } from 'svelte';
	import Sub from './sub.svelte';

	class Person1 {
		value = $state({ person: 'John', age: 33 })
	}
	const class_nested_state = $state(new Person1());

	class Person2 {
		person = $state('John');
		age = $state(33);
	}
	const state_nested_class = $state({ value: new Person2() });

	const nested_state = $state({ person: 'John', age: 33 });

	setContext('foo', {
		nested_state,
		get class_nested_state() { return class_nested_state },
		get state_nested_class() { return state_nested_class }
	})
</script>

<Sub {class_nested_state} {state_nested_class} {nested_state} />
