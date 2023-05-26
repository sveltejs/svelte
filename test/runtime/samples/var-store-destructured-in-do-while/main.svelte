<script>
	import { writable } from "svelte/store";

	var thing = { a: writable(3), m: writable(4), n: writable(5) };

  do {
    var { a } = thing;
  } while (false);

  do var { m: c, n: b } = thing; while (false);

	var x = $a;
	var y = $b;
	var z = $c;
</script>

<p>{x}</p>
<p>{y}</p>
<p>{z}</p>
