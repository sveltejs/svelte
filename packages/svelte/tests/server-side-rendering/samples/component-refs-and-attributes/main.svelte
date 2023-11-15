<script>
	export let widget;

	import Widget from './Widget.svelte';

	export let foo = 42;
</script>

<div><Widget bind:this={widget} foo='{foo}'/></div>
