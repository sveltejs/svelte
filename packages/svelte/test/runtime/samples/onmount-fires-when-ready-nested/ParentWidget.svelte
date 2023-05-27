<script>
	import Widget from './Widget.svelte';

	export let foo;
</script>

<Widget/>{#if foo}<Widget/>{/if}
