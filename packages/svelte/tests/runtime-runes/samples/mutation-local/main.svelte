<script>
  function localMutation(input) {
    // Tests that this does not become a signal which would cause an "cannot mutate during render" error
    let x = input;
    if (x > 0) {
      x = 2;
    }
    return x;
  }

  const x = localMutation(1);
</script>

{x}
