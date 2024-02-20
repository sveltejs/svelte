<script>
	import Component from "./Component.svelte";

	export let visible;
</script>

<div on:some-event='{() => visible = !visible}'>toggle</div>
<Component on:event-name={() => visible = !visible}></Component>

{#if visible}
	<p>hello!</p>
{/if}
