<script lang="ts">
  const first = Promise.resolve(1);
  const second = Promise.resolve(2);
  const third = Promise.resolve(3);
</script>

{#each await Promise.resolve([first, second, third]) as item}
  {await item}
{/each}
