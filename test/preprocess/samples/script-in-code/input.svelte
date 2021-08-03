<script>
  let a = 1;
</script>

<script context="module">
  let b = 2;
</script>

{@html '<script>let c = 3;</script>'}

<script context="worker">
  let d = 4;
</script>

{@html `
  <script>
    let e = 5;
  </script>
`}

<script>
  let f = 6;
</script>
