<script>
  let foo1;
  let foo2;
  for (let bar = (foo1 = 0); bar < 5; bar += 1) {
    foo1 = foo2;
  }
</script>

<h1>{foo1} {foo2}</h1>
