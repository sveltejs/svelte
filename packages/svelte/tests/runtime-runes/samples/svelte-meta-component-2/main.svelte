<script lang="ts">
	import Child from './child.svelte';
	import Passthrough from './passthrough.svelte';

	let show = $state(true);
</script>

<p>main</p>
<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<p>main if</p>
{/if}

<Child />
<Child />

<Passthrough>
	<p>main snippet</p>
</Passthrough>

<svelte:element this={'p'}>main dynamic</svelte:element>
