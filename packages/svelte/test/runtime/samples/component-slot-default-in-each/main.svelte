<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:item let:value>
	<div>{item} - {value}</div>
</Nested>