<script>
  export let a;
  let i = 0; 
  do {
    var b = a * i;
  } while (++i <= a);
</script>

<p>{b}</p>
