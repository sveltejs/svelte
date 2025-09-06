<script>
	let connected = $state(false);
	let disposed = $state(false);

	const getConn = () => {
		connected = true;
		return {
			[Symbol.dispose]() {
				disposed = true;
			}
		}
	}

	using conn = getConn();
</script>

<p>connected: {connected}</p>
<p>disposed: {disposed}</p>