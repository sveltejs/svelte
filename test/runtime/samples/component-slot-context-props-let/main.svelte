<script>
	import Nested from './Nested.svelte';
	export let log = [];
</script>

<Nested {log} let:set let:key>
	<button type="button" on:click={() => set(`value-${key}`)}>Set {key}</button>
</Nested>
