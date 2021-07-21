<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things}>
	<svelte:fragment slot="main" let:thing={x}>
		<span>{x}</span>
	</svelte:fragment>
</Nested>