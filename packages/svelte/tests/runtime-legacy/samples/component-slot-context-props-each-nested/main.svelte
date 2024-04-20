<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:set let:key let:item>
	<button type="button" on:click={() => set(`value-${key}-${item}`)}>Set {key}-{item}</button>
</Nested>
