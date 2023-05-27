<script>
	import { writable } from "svelte/store";

	var thing = [writable(3), writable(4), writable(5)];

	if (true) {
		var [a] = thing;
	}

	if (true) var [, c, b] = thing;

	var x = $a;
	var y = $b;
	var z = $c;
</script>

<p>{x}</p>
<p>{y}</p>
<p>{z}</p>
