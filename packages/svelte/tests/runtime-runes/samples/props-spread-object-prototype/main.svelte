<script>
	import Child from './Child.svelte';

	const rest = { foo: 1 };
</script>

<Child toString="a" constructor="b" {...rest} />
