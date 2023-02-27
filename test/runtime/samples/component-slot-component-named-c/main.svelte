<script>
	import Nested from './Nested.svelte';
	import Hello from './Hello.svelte';
	import World from './World.svelte';
</script>

<Nested>
	<Hello slot="name" />
</Nested>

<Nested>
	<World slot="name" />
</Nested>