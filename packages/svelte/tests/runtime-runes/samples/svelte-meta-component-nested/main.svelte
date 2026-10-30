<script>
	import Component from './Component.svelte';
	const components = { Component };
</script>

<div>
	<Component />
	<p><strong>after</strong></p>
</div>

<Component />
<Component />
<p>after consecutive</p>

<components.Component />
<p>after dynamic</p>

{#snippet content()}
	<Component />
	<p>after in snippet</p>
{/snippet}
{@render content()}
