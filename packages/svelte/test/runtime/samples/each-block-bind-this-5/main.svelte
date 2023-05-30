<script>
	const set = new Set();
  set.add(new Set([...'0123'].map(i => ([i]))));
  set.add(new Set([...'456'].map(i => ([i]))));
  set.add(new Set([...'789'].map(i => ([i]))));

  export let bindings = [];
</script>

{#each set as newSet}
  {#each newSet as piece}
    <p bind:this={bindings[piece[0]]}>{piece[0]}</p>
  {/each}
{/each}
