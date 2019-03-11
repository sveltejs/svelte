<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<span slot="name">Hello</span>
</Nested>

<Nested>
	<span slot="name">world</span>
</Nested>