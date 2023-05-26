<script>
  import { writable } from "svelte/store";

  for (let i = 0; i < 1; i += 1) {
    var a = writable(3);
  }

  for (let i = 0; i < 1; i += 1)
    var b = writable(5);

  var x = $a;
  var y = $b;
</script>

<p>{x}</p>
<p>{y}</p>
