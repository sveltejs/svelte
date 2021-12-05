<script>
	import Nested from './Nested.svelte';

	export let observable;
	export let visible;
</script>

{#if visible}
	<Nested {observable}/>
{/if}