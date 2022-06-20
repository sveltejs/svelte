<script>
  let world1 = 'world';
  let world2 = 'world';
  const world3 = 'world';
  function foo() {
    world3 = 'svelte';
  }

</script>
<div>
  <p>Hello world</p>
  <p>Hello {world1}</p>
  <p>Hello {world2}</p>
</div>
<div>
  <p>Hello {world3}</p>
</div>
