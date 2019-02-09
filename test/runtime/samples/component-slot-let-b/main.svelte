<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<span>{count}</span>
</Nested>