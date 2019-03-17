<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:foo={bar}>
	<p>{bar}</p>
</Nested>