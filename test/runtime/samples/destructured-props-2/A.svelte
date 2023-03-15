<script>
  import { writable } from 'svelte/store';

  let default_b = 5;
  const LIST = [1, { a: 2 }, [3, writable(4)]];
  export const [x, { a: list_two_a, b: list_two_b = default_b }, [, y]] = LIST;
  export let [m, { a: n, b: o = default_b }, [p, q]] = LIST;
</script>

<div>
  x: {x},
  list_two_a: {list_two_a},
  list_two_b: {list_two_b},
  y: {$y},
  m: {m},
  n: {n},
  o: {o},
  p: {p},
  q: {$q}
</div>
<div>{JSON.stringify(LIST)}</div>