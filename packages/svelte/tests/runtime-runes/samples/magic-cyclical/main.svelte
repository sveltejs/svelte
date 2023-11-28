<script>
	import { magic } from 'svelte';

	const ping = magic({});
	ping.pong = { ping, pang: 'hello!' };
</script>

<button onclick={() => ping.pong.pang = 'goodbye!'}>
	{ping.pong.ping.pong.ping.pong.pang}
</button>
