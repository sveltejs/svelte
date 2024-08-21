<script module>
	let toast1 = $state();
	let toast2 = $state({});

	export async function show_toast() {
		toast1 = {
			message: 'foo',
			show: true
		};
		toast1.show = false;

		toast2 = {
			message: 'foo',
			show: true
		};
		toast2.show = false;
	}
</script>
