<script>
	import Component from './Component.svelte';
</script>

<Component>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div slot='foo' on:click>hi!</div>
</Component>
