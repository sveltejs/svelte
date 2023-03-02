<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<p slot="foo">{value}</p>
	<p slot="foo">{value}</p>
</Nested>