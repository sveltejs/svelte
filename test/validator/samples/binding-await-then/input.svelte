<script>
  let promise = 0;
</script>
{#await promise then value}
  <input bind:value />
{/await}
