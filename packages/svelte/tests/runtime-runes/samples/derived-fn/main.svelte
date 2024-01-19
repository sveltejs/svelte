<script>
  let count = $state(0);
  let double = $derived.fn(() => count * 2);
</script>

<button on:click={() => count++}>{double}</button>
