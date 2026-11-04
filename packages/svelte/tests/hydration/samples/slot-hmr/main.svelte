<script>
	import Lib from './Lib.svelte';
	import Snippet from './Snippet.svelte';
	import Child from './Child.svelte';
</script>

<Snippet>
	<Lib>
		<Child />
		<svelte:fragment slot="named"><Child /></svelte:fragment>
	</Lib>
</Snippet>
