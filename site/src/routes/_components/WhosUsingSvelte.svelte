<!--
	Instructions for adding new logos:

	* Fork this repo, and clone your fork
	* Create a branch called e.g. `add-myorganisation-logo`
	* Add the logo to the `static/organisations` directory (preferably SVG)
	* Add a new <a> tag in this component, in alphabetical order
	* Create a pull request. Thanks!
-->

<style>
	.logos {
		margin: 1em 0 0 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
    justify-content: space-between;
	}

	a:not(.btn) {
		height: 5rem;
		margin: 0 1.6rem 3.2rem;
		text-decoration: none;
	}

	img { height: 100% }

	@media (min-width: 540px) {
		a:not(.btn) {
			height: 6rem;
			padding: 1rem 2rem;
			border-radius: var(--border-r);
		}
	}
</style>

<div class="logos">
	<a href="https://beyonk.com"><img src="organisations/beyonk.svg" alt="Beyonk logo"></a>
	<a href="https://chess.com" style="background-color: rgb(49,46,43);"><img src="organisations/chess.svg" alt="Chess.com logo"></a>
	<a href="https://datawrapper.de"><img src="organisations/datawrapper.svg" alt="Datawrapper logo"></a>
	<a href="https://db.nomics.world" style="background-color: rgb(15,39,47);"><img src="organisations/dbnomics.png" alt="DBNomics logo"></a>
	<a href="https://from-now-on.com"><img src="organisations/from-now-on.png" alt="From-Now-On logo"></a>
	<a href="https://itslearning.com"><img src="organisations/itslearning.svg" alt="itslearning logo"></a>
	<a href="http://mustlab.ru"><img src="organisations/mustlab.png" alt="Mustlab logo"></a>
	<a href="https://www.nesta.org.uk"><img src="organisations/nesta.svg" alt="Nesta logo"></a>
	<a href="https://nytimes.com"><img src="organisations/nyt.svg" alt="The New York Times logo"></a>
	<a href="https://www.stone.co"><img src="organisations/stone.svg" alt="Stone Payments logo"></a>
	<p><a href="https://github.com/sveltejs/svelte/blob/master/site/src/routes/_components/WhosUsingSvelte.svelte" class="btn bg-flash white">+ your company?</a></p>
</div>
