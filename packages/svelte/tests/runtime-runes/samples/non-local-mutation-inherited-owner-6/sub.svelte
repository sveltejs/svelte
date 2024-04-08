<script>
	import { getContext } from "svelte";

	const foo = getContext('foo')
</script>

<button onclick={() => {
	foo.class_nested_state.value.age++;
	foo.state_nested_class.value.age++;
	foo.nested_state.age++;
}}>mutate</button>
