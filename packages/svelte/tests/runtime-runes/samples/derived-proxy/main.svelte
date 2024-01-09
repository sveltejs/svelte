<script>
  let count = $state(0);
  let double = $derived({ get value() { return count * 2}, set value(c) { count = c / 2 } });
</script>

<button on:click={() => count++}>{count} / {double.value}</button>
<button on:click={() => double.value += 2}>{count} / {double.value}</button>
