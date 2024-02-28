
<script>
  function get_values() {
    let a = $state(0);
    let b = $state(0);
    let c = $state(0);

    return {
       get a() { return a },
       get b() { return b },
       get c() { return c },
			 increment() {
				a++;
				b++;
				c++;
			 }
    };
  }

  const { a, b, c, increment } = $derived(get_values());
</script>

<button onclick={increment}>{a} {b} {c}</button>
