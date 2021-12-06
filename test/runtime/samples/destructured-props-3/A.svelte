<script>
  import { writable } from 'svelte/store';

  const { i, j, k } = { i: 9, j: 10, k: writable(11) }, l = 12, m = 13, n = writable(14);
  let { a, b, c } = { a: 9, b: 10, c: writable(11) }, d = 12, e = 13, f = writable(14);

  export { i, k, l, n, a, c, d, f };
</script>

<div>i: {i}, j: {j}, k: {$k}, l: {l}, m: {m}, n: {$n}, a: {a}, b: {b}, c: {$c}, d: {d}, e: {e}, f: {$f}</div>