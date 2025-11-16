<script>
	import { fork, flushSync } from "svelte";
	
	let state = $state(0);

	let count = $derived(state);

	let forked;
</script>

<button onclick={()=>{
	forked = fork(()=>{
		state++;
	})
}}></button>

<button onclick={()=>{
	state++;
}}></button>

{#if count === 1}
	<p>one</p>
{/if}