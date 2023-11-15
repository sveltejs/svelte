<script>
  let count = $state(0);
  const doubled = () => count * 2;
  const inc = () => count++;
  let double = $derived(doubled());
</script>

<button on:click={inc}>{double}</button>
