<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:c let:count>
	<span>{c} ({count})</span>
</Nested>