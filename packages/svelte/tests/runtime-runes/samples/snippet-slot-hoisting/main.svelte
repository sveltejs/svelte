<script>
	import Render from './Render.svelte';
	import Runes from './Runes.svelte';
</script>

{#snippet forward(value)}
	<Render children={content} {value} />
{/snippet}

{#snippet content(value)}
	<div><slot {value}>fallback {value}</slot></div>
{/snippet}

{#snippet backward(value)}
	<Render children={content} {value} />
{/snippet}

<Render children={forward} value="first" />
<Render children={backward} value="second" />
<Runes>
	<p>runes</p>
	<span slot="named">named</span>
</Runes>
