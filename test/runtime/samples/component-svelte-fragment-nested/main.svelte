<script>
	import Child from './Child.svelte';
</script>

<Child>
	<svelte:fragment>
		Default
	</svelte:fragment>
	<svelte:fragment slot="b">
		<p>B slot</p>
	</svelte:fragment>
</Child>
