<script>
	let { arr } = $props();

	let local_arr = $derived($state(arr));
</script>

<button onclick={()=>{
	local_arr.push(local_arr.length + 1);
}}>push</button>
{#each local_arr as item}
	<p>{item}</p>
{/each}
