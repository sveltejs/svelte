<script>
	import { flushSync } from 'svelte'
	
	let flag = $state(true)
	let test = $state(true);	
</script>

<button onclick={()=>{
	flushSync(() => {
		test = !test
	})
		
	flag = !flag;
}}>switch</button>

<main>
	<div>{flag}</div>
	
	{#if !flag}
		<div>{test} </div>
	{/if}
</main>

