<script>
	let visible = $state(0);
	
	function in_and_out() {
		console.log($effect.tracking()); 
	}
</script>

<button onclick={() => visible = !visible}></button>

{#if visible}
	<div transition:in_and_out></div>
{/if}