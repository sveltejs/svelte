<script>
	let open = false;
	function toggle() {
		open = !open;
	}
</script>

<div on:click={toggle}>
 <slot name="target" {open}></slot>
	
	<!-- This actually isn't necessary to reproduce. -->
	{#if open}
 	  <slot name="content"></slot>
	{/if}
</div>
