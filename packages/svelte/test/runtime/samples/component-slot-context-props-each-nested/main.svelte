<script>
	import Nested from './Nested.svelte';
	export let log = [];
</script>

<Nested {log} let:set let:key let:item>
	<button type="button" on:click={() => set(`value-${key}-${item}`)}>Set {key}-{item}</button>
</Nested>