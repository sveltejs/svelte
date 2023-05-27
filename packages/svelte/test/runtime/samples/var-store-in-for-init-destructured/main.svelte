<script>
  import { writable } from "svelte/store";
  for (var { a = writable(4), z: b } = { z: writable(3) }; $a * $b < 1000; ) {
    a.update(c => c + 1);
    b.update(b => b + 1);
  }
</script>

<p>{$a}</p>
<p>{$b}</p>
