<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things} let:thing={x}>
	<span>{x}</span>
</Nested>