<script>
	import Component from './Component.svelte';

	const object = {
		property: Component
	};
</script>

{#snippet not_hoisted()}
	<object.property />
{/snippet}

{@render not_hoisted()}
