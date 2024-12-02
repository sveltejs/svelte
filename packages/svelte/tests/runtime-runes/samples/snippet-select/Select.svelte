<script>
	let { children, ...rest } = $props();
</script>
<select name="pets" id="pet-select1" {...rest}>
  {@render children()}
</select>
