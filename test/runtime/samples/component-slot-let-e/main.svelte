<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:someText={someText}>
	<p>{someText}</p>
</Nested>
