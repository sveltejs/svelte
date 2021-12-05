<script>
	import Nested from './Nested.svelte';

	let name = 'world';
</script>

<Nested>
	<span slot="name">Hello {name}</span>
</Nested>