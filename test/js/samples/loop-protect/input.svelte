<script>
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