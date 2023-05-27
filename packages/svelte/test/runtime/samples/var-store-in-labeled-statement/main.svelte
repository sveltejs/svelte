<script>
	import { writable } from "svelte/store";

	yes: {
		var a = writable(3);
	}

	no: var b = writable(5);

	var x = $a;
	var y = $b;
</script>

<p>{x}</p>
<p>{y}</p>
