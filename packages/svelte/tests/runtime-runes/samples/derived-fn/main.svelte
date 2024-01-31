<script>
  let count = $state(0);
  let double = $derived.call(() => count * 2);
</script>

<button on:click={() => count++}>{double}</button>
