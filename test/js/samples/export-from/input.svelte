<script context="module">
  export { a, b } from './a';
  export { c } from './b';
  export { d as e } from './c';
</script>

<script>
  export { f, g } from './d';
  export { h } from './e';
  export { i as j } from './f';
</script>
