<script>
  import { writable } from "svelte/store";
	
	const val1 = 1;
	const val2 = 10;

	switch (val1) {
		case 1:
			var a = writable(3);
			break;
		case 2:
			var a = writable(4);
			break;
		default:
			var a = writable(5);
			break;
	}

	switch (val2) {
		case 1: {
			var b = writable(3);
			break;
		}
		case 2: {
			var b = writable(4);
			break;
		}
		default: {
			var b = writable(5);
			break;
		}
	}

  var x = $a;
  var y = $b;
</script>

<p>{x}</p>
<p>{y}</p>
