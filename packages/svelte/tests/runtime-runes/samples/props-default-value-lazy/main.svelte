<script>
	let log = $state([]);

	const fallback_value = 1;
	const nested = {
		get fallback_value() {
			log.push('nested.fallback_value');
			return fallback_value;
		}
	}
	const fallback_fn = () => {
		log.push('fallback_fn');
		return fallback_value;
	}

	const {
		p0 = 1,
		p1 = fallback_value,
		p2 = nested.fallback_value,
		p3 = fallback_fn(),
		p4 = 1,
		p5 = fallback_value,
		p6 = nested.fallback_value,
		p7 = fallback_fn()
	} = $props();
</script>

<p>props: {p0} {p1} {p2} {p3} {p4} {p5} {p6} {p7}</p>
<p>log: {log}</p>
