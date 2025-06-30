<script>
	import Child from "./child.svelte";
	import Passthrough from "./passthrough.svelte";
	let x = { y: Child }
	let key = 'test';
</script>

<p>no parent</p>

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

<x.y />
