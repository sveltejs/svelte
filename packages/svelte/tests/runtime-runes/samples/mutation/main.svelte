<script>
  let pending = $state([]);

  function createTogglePending() {
    const id = 1;
    const togglePending = () => {
      if (pending.includes(id)) {
        pending = pending.filter((p) => p !== id);
      } else {
        pending = [...pending, id];
      }
    };
    return {togglePending, id};
  }

  const toggle1 = createTogglePending();
</script>

<button on:click={toggle1.togglePending}>
  {toggle1.id} / {pending.includes(toggle1.id)}
</button>
