<svelte:options runes />
<script lang="ts">
  // issue #10179 - binding with type cast
  let element = null;
  let with_state = $state({ foo: 1 });
  let without_state = { foo: 2 };
  let non_null_assertion = $state(null);
</script>

<div bind:this={element as HTMLElement}>{JSON.stringify({ with_state, without_state, non_null_assertion })}</div>
<input type="number" bind:value={(with_state as { foo: number }).foo} />
<input type="number" bind:value={(without_state as { foo: number }).foo as number} />
<input type="number" bind:value={non_null_assertion!} />
