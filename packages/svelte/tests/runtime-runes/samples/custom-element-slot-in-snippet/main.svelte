<script>
	import Component from './Component.svelte';
</script>

<Component>
	{#snippet children()}
		Default
		<span slot="slot">Slotted</span>
	{/snippet}
</Component>
