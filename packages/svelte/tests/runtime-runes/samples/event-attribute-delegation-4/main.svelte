<script>
	import { log } from "./log";
	import Sub from "./sub.svelte";
</script>

<svelte:window onclick="{() => log.push('window main')}" />
<svelte:document onclick="{() => log.push('document main')}" />

<div on:click={() => log.push('div main 1')} on:click={() => log.push('div main 2')}>
	<button onclick={() => log.push('button main')}>main</button>
</div>

<Sub />
