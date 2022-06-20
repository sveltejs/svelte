<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	Hello

	<p slot='foo'>foo</p>
	<p slot='bar'>bar</p>
</Nested>