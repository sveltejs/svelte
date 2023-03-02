<script>
	import Nested from './Nested.svelte';
	import Hello from './Hello.svelte';

	let name = 'world';
</script>

<Nested>
	<Hello slot="name" {name} />
</Nested>