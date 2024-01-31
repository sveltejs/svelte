<script>
	const ping = $state({});
	ping.pong = { ping, pang: 'hello!' };
</script>

<button onclick={() => ping.pong.pang = 'goodbye!'}>
	{ping.pong.ping.pong.ping.pong.pang}
</button>
