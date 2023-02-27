<script>
  let promise = 0;
</script>
{#await promise}
{:catch error}
  <input bind:value={error} />
{/await}
