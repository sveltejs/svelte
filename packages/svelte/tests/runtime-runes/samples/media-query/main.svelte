<script>
	import { MediaQuery } from "svelte/reactivity"

	const mq = new MediaQuery("(max-width: 599px), (min-width: 900px)");
	const mq2 = new MediaQuery("min-width: 900px");
	const mq3 = new MediaQuery("screen");
	const mq4 = new MediaQuery("not print");
	const mq5 = new MediaQuery("screen,print");
	const mq6 = new MediaQuery("screen,      print");
	const mq7 = new MediaQuery("screen,      random");
</script>
