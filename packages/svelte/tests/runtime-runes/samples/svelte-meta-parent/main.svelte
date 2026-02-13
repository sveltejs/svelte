<script>
	import Child from "./child.svelte";
	import Passthrough from "./passthrough.svelte";
	let x = { y: Child }
	let key = 'test';
	let show = $state(true);
</script>

<p>no parent</p>
<button onclick={() => show = !show}>toggle</button>

{#if true}
	<p>if</p>
{/if}

{#each [1]}
	<p>each</p>
{/each}

{#await Promise.resolve()}
	<p>loading</p>
{:then}
	<p>await</p>
{/await}

{#key key}
	<p>key</p>
{/key} 

<Child />

<Passthrough>
	<Child />
</Passthrough>

<Passthrough>
	<Passthrough>
		<Child />
	</Passthrough>
</Passthrough>

{#if show}
	<Passthrough>
		{#snippet named()}
			<p>hi</p>
		{/snippet}
	</Passthrough>
{/if}

<x.y />
