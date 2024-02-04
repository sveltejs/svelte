<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<slot slot="abc" name="abc" let:value {value} />
</Nested>
