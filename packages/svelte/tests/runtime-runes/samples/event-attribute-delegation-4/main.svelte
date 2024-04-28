<script>
	import Component from "./Component.svelte";
	import Sub from "./sub.svelte";
</script>

<svelte:window onclick="{() => console.log('window main')}" />
<svelte:document onclick="{() => console.log('document main')}" />

<Component on:click={() => console.log('div main 1')} on:click={() => console.log('div main 2')}>
	<button onclick={() => console.log('button main')}>main</button>
</Component>

<Sub />
