<script>
	import Outer from './Outer.svelte';
	import Inner from './Inner.svelte';

	let object = $state({ count: 0 });
	let test = $state(true);
</script>

<Outer>
	<!-- check that render effects inside slotted content doesn't mess with ownership validation -->
	{#if test}
		<Inner bind:object />
	{/if}
</Outer>
