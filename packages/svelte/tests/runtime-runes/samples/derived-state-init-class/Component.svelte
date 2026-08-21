<script>
	import { Test } from "./Class.svelte.js";
	let { arr } = $props();

	let test = new Test(() => arr);
</script>

<button onclick={()=>{
	test.local_arr.push(test.local_arr.length + 1);
}}>push</button>
{#each test.local_arr as item}
	<p>{item}</p>
{/each}
