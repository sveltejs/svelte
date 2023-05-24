<script>	
	export let primary = true;
	let elem;
</script>

<div
	bind:this={elem}
	class="test-class"
	class:primary
  {...{ role: 'button' }} 
></div>
