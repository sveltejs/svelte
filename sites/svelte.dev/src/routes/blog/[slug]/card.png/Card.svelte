<script>
	export let post;
</script>

<div class="card">
	<img src="https://sveltejs.github.io/assets/artwork/svelte-machine.png" alt="Svelte Machine" />

	<div class="text">
		<h1>{post.title}</h1>
		<p class="date">{post.date_formatted}</p>
	</div>
</div>

<style>
	.card {
		display: flex;
		width: 100%;
		height: 100%;
		font-family: 'Overpass';
		background: white;
	}

	img {
		position: absolute;
		width: 125%;
		height: 100%;
		top: 5%;
		left: 0;
		object-fit: cover;
	}

	.text {
		display: flex;
		position: absolute;
		left: 80px;
		width: 55%;
		height: 80%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	h1 {
		font-size: 72px;
		margin: 0;
		color: #222;
		font-weight: 400;
		line-height: 80px;
		margin: 0 0 0.5em 0;
	}

	.date {
		font-size: 32px;
		margin: 0;
		color: #555;
		text-transform: uppercase;
	}
</style>
