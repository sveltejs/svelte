<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:value>
	<p>{value}</p>
</Nested>