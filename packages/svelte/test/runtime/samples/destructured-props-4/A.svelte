<script>
  import { writable } from 'svelte/store';

  const THING = { a: 1, b: { c: 2, d: [3, 4, writable(5), 6, 7] }, e: [6], h: 8 };
  const default_g = 9;

  export let { a, b: { c, d: [d_one, ...[, ...[d_three, ...{ length }]]], f }, e: [e_one], g = default_g } = THING;
  export const { a: A, b: { c: C } } = THING;
</script>

<div>
a: {a},
b: {typeof b},
c: {c},
d_one: {d_one},
d_three: {$d_three},
length: {length},
f: {f},
g: {g},
e: {typeof e},
e_one: {e_one},
A: {A},
C: {C}
</div>
<div>{JSON.stringify(THING)}</div>
