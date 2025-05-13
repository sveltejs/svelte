<script>
	let show = $state(true);
	let time = $state(0);
</script>

<button onclick={()=> show = false}></button>
{#if show}
	<audio bind:currentTime={()=>time,(new_time)=>{
		console.log("event");
		time = new_time;
	}}></audio>
{/if}