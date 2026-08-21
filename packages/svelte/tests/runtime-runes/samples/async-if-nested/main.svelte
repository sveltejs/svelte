<script>
  let foo = $state(false);
  let blocking = $derived(await foo);
  let bar = Promise.resolve(true);
</script>

{#if foo}
  foo
{:else if await bar}
  bar
{:else}
  else
{/if}

{#if foo}
  foo
{:else if !blocking}
  blocking
{:else}
  else
{/if}
