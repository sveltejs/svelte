<script>
	const x = -0;
	let d = $derived(-0);
	let positive = $state(false);
</script>

<p>{1 / -0}</p>
<p>{1 / x}</p>
<p>{1 / d}</p>
<p>{1 / (-1 * 0)}</p>
<p>{1 / Math.round(-0.1)}</p>
<p>{1 / Number('-0')}</p>
<p>{1 / (true && -0)}</p>
<p>{1 / (-0 ?? 0)}</p>
<p>{1 / (true ? -0 : 0)}</p>
<p>{1 / -(-0)}</p>
<p>{1 / (-0 || 0)}</p>
<p>{positive ? 0 / 0 : 0 / 0}</p>
<p id="mixed">{1 / (positive ? 0 : -0)}</p>
<p id="same">{1 / (positive ? -0 : -0)}</p>

<button onclick={() => positive = !positive}>toggle</button>
