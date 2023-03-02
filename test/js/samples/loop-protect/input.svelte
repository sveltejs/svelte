<script>
  let node;

  function foo() {
    const guard = 'foo';
    while(true) {
      console.log(guard);
    }
  }

  while(true) {
    foo();
  }
  for(;;) {
    foo();
  }
  while(true) foo();
  $: while(true) foo();
  do foo(); while(true);
  $: do foo(); while(true);
</script>

<div bind:this={node}></div>