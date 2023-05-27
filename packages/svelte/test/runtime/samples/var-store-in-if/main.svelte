<script>
	import { writable } from "svelte/store";

	if (true) {
		var a = writable(3);
	} else {
		var a = writable(4);
	}

	if (false) var b = writable(2);
	else var b = writable(5);

	var x = $a;
	var y = $b;
</script>

<p>{x}</p>
<p>{y}</p>
