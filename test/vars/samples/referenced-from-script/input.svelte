<script>
  import i from 'foo';
  import * as j from 'foo';
  import { k } from 'foo';
  let a, b, c, d, e, f, g, h;
  
  function foo() {
    a = 1;
    console.log(b);
    return c + d.e + h++ + l();
  }
  function l() {}

  export { f }
  export const bar = g;
</script>
