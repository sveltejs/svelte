<script>
	export let condition;
</script>



<div class="level2">
	<h4>level 2</h4>
	{#if condition}
		<span>TRUE! <slot></slot></span>
	{:else}
		<span>FALSE! <slot></slot></span>
	{/if}
</div>