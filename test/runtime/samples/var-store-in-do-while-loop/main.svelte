<script>
  import { writable } from "svelte/store";

  do {
    var a = writable(3); 
  } while (false);

  do var b = writable(5); while (false);

  var x = $a;
  var y = $b;
</script>

<p>{x}</p>
<p>{y}</p>
