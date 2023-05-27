<script>
	import { writable } from "svelte/store";

	{
		{
			if (true) var a = writable(3);
		}

		if (true) var b = writable(4);
	}

	{
		if (true) var c = writable(5);
	}

	var x = $a;
	var y = $b;
	var z = $c;
</script>

<p>{x}</p>
<p>{y}</p>
<p>{z}</p>
