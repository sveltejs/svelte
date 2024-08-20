<script>
	let { title, content } = $props();
</script>

<header>
	<nav>
		<a href="/">Home</a>
		<a href="/away">Away</a>
	</nav>
</header>

<main>
	<h1>{title}</h1>
	<div class="static">
		<p>we don't need to traverse these nodes</p>
	</div>
	<p>or</p>
	<p>these</p>
	<p>ones</p>
	{@html content}
</main>

<cant-skip>
	<custom-elements with="attributes"></custom-elements>
</cant-skip>
