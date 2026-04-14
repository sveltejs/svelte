<script>
	export function increment() {
		inc();
	}
	let inc;
	$effect.root(() => {
		let count = $state(0);
		let double = $derived(count * 2);
		inc = () => {
			count++;
			console.log('count', count, 'double', double);
		}
	})
</script>
