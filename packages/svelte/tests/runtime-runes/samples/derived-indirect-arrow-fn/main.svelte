<script>
  let count = $state(0);
  const doubled = () => count * 2;
  let double = $derived(doubled());
</script>

<button on:click={() => count++}>{double}</button>
