<script>
  const gate = new Promise((resolve) => setTimeout(resolve, 100));
  const second = new Promise((resolve) => setTimeout(() => resolve('second'), 500));
  let closed = $state();
</script>

{#await gate then}
  <details bind:open={() => !closed, (open) => (closed = !open)}><summary>group</summary></details>
  <p>{await second}</p>
{/await}
