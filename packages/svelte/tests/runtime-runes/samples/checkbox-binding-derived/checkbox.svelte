<script>
  let { value = $bindable(), config } = $props();
</script>

<label>
  <input type="checkbox" bind:checked={value} />
  {config.title}
</label>
