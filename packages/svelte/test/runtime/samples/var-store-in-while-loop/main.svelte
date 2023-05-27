<script>
	import { writable } from "svelte/store";

	while (!a) {
		var a = writable(3);
	}

	while (!b) var b = writable(5);

	var x = $a;
	var y = $b;
</script>

<p>{x}</p>
<p>{y}</p>
