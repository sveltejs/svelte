<script module>
	class Box {
		static {
			let derived = 1;
			var state = 2;
		}
	}
</script>

<script>
	let count = $state(1);
	let double = $derived(count * 2);
</script>

<p>{double}</p>
