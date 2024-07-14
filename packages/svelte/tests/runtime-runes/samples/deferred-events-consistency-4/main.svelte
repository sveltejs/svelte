<script>
	let toggle = $state(false);
	function action(element) {
		const handle = () => {
			console.log('failed')
		}
		element.addEventListener('click', handle);
		return {
			update(toggle) {
				if (toggle) {
					element.removeEventListener('click', handle);
				}
			}
		}
	}
</script>

<button use:action={toggle} onmouseup={() => { toggle = true }}>
	click me
</button>
