<script>
  function createArray(initial) {
    let array = $state(initial);
    return {
      get value() {
        return array;
      },
      push(entry) {
        array.push(entry);
        array = array.slice();
      },
      pop() {
        array.pop();
        array = array.slice();
      },
    };
  }

  const array = createArray(['x']);
</script>

<button on:click={() => array.push('y')}>Add entry</button>

{#each array.value as entry}
  <p>{entry}</p>
{/each}

{#if array.value.length > 1}
  <button on:click={() => array.pop()}>Remove entry</button>
{/if}
