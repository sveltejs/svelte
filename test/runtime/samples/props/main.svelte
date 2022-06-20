<script>
	import RenderProps from './RenderProps.svelte';

	export let x;
</script>

<RenderProps {x}>
	<p>some (unused) slotted content, to create an internal prop</p>
</RenderProps>