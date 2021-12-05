<script>
	export let domain = [0, 10];
	export let range = [0, 100];
	export let x = 5;

	let scale;

	$: scale = num => {
		const t = domain[0] + (num - domain[0]) / (domain[1] - domain[0]);
		return range[0] + t * (range[1] - range[0]);
	};
</script>

<p>{scale(x)}</p>