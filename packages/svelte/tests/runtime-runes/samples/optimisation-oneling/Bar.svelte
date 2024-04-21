<script>
  let { count } = $props();
</script>

{#if count % 2 === 0}
  <span>{count}</span>
{/if}
