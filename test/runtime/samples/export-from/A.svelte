<script context="module">
  export { a, b } from './B.svelte';
  export { c as d } from './B.svelte';
</script>

<script>
  export { d, e } from './B.svelte';
  export { f as g } from './B.svelte';
  let e = 123;
  let b = 234;
  function foo() {
    e = 456;
    b = 567;
  }
</script>

a: {typeof a}<br />
b: {typeof b}<br />
c: {typeof c}<br />
d: {typeof d}<br />
e: {typeof e}<br />
f: {typeof f}<br />
g: {typeof g}<br />