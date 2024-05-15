<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:set let:key>
	<button type="button" on:click={() => set(`value-${key}`)}>Set {key}</button>
</Nested>
