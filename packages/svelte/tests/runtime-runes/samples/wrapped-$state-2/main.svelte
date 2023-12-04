<script>
  function createReactive(obj) {
    const reactive = {};
    for (const key of Object.keys(obj)) {
      let inner = $state(obj[key]);
      Object.defineProperty(reactive, key, {
        get() {
          return inner;
        },
        set(update) {
          inner = update;
        },
        enumerable: true,
      });
    }
    return reactive;
  }

  const a = createReactive({x: 'foo'});
</script>

<button on:click={() => (a.x = 'bar')}>{a.x}</button>
