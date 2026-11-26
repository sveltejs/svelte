<script>
  function complex1() {
    return 1;
  }

  let foo = $state(true);
  let blocking = $derived(await foo);
</script>

<!-- simple chain - should have no nested $.if() -->
{#if foo}
  foo
{:else if bar}
  bar
{:else}
  else
{/if}

<!-- simple chain with await expressions - should have $.if() at each await expression -->
{#if await foo}
  foo
{:else if bar}
  bar
{:else if await baz}
  baz
{:else}
  else
{/if}

<!-- simple chain with await expressions #2 - should have $.if() at each await expression (ideally we can detect that await foo is unnecessary to await multiple times and this is one $.if()) -->
{#if await foo > 10}
  foo
{:else if bar}
  bar
{:else if await foo > 5}
  baz
{:else}
  else
{/if}

<!-- simple chain with some expressions that cause a $.derived - should be one $.if() -->
{#if simple1}
  foo
{:else if simple2 > 10}
  bar
{:else if complex1() * complex2 > 100}
  baz
{:else}
  else
{/if}

<!-- simple chain with blocking expressions - should be one $.if() -->
{#if blocking > 10}
  foo
{:else if blocking > 5}
  bar
{:else}
  else
{/if}
