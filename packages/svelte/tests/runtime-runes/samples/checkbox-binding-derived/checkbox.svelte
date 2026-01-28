<script>
  let { value = $bindable() } = $props();
</script>

<label>
  <input type="checkbox" bind:checked={value} />
</label>
