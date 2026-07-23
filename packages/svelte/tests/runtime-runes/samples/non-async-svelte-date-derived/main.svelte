<script>
    import { onMount } from "svelte";
    import { SvelteDate } from "svelte/reactivity";

	let date = $state(function() {
		const date = new SvelteDate(1995, 11, 17, 0, 0, 0);
		return date;
	}());
	const selectedHour = $derived(date?.getHours());
	let count = $state(0)

	$effect(() => {
		const date1 = new Date(1995, 11, 17, 0, 0, 0);
		date1.setHours(count);
		if (date.valueOf() != date1.valueOf()) {
			date = new SvelteDate(date1.valueOf())
		}
	});

	onMount(() => {
		date.setHours(1);
	})

	function updateHours() {
		count = 5;
		date.setHours(5);
	}

</script>

<h1>{selectedHour}</h1>


<button onclick={updateHours}>update</button>