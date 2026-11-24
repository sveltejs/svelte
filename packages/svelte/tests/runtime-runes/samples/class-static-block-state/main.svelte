<script>
	class Box {
		static value;

		static {
			let count = $state(1);
			let double = $derived(count * 2);

			count += 1;
			Box.value = double;
		}
	}
</script>

<p>{Box.value}</p>
