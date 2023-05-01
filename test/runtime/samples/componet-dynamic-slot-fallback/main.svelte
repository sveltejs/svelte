<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<p slot='baz'>not fallback</p>
</Nested>
