<script>
	export let items = {0:{clicked:false},length:4};
</script>

<button on:click={()=>{
	items[0].clicked=true;
	items[2]={clicked:true};
}}>Show</button>

{#each items as item, i}
	{@const v_item=item}
	<p>
		{i}
		{#if v_item?.clicked}
			show (v_item)
		{/if}
		{#if item?.clicked}
			show (item)
		{/if}
	</p>
{/each}
