<section>
	<div class="inner"><slot /></div>
</section>

<style>
	section {
		padding: 10rem 0;
		background: var(--background, white);
	}

	.inner {
		max-width: 120rem;
		padding: 0 var(--side-nav);
		margin: 0 auto;
	}
</style>
