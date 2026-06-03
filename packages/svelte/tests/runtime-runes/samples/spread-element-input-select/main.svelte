<script>
	let { value = "Hello", spread = { disabled: false } } = $props();
</script>

<button onclick={()=> spread = { disabled: false }}></button>

<select bind:value {...spread}>
  <option>Hello</option>
  <option>World</option>
</select>
