<!-- Edge cases for CSS pruning optimizations:
  1. ~= word matching (indexOf vs split)
  2. Deep combinator chains (index-based apply_selector)
  3. :has() combined with other selectors (single-pass handling)
  4. Escaped selectors (backslash skip optimization)
  5. :is()/:where()/:not() with deep selectors
-->

<!-- ~= word matching edge cases -->
<div class="foo bar">word match</div>
<div class="foobar">substring only</div>
<div class="bar-foo baz">hyphen separated</div>
<div class="afoo foo-x">prefix substring</div>

<!-- Deep combinator chains -->
<main>
	<article>
		<section>
			<div>
				<span class="deep">deep</span>
			</div>
		</section>
	</article>
</main>

<!-- :has() with class selectors -->
<nav class="primary">
	<a href="/">link</a>
</nav>
<nav class="secondary">
	<button>action</button>
</nav>

<!-- Escaped selectors -->
<p class="a-b">escaped</p>

<!-- :is()/:where()/:not() with combinators -->
<header>
	<h1>title</h1>
</header>
<ul>
	<li class="active"><span>item</span></li>
</ul>

<style>
	/* === ~= word matching === */

	/* Should match: "foo" is a whole word in class="foo bar" */
	.foo { color: green; }

	/* Should match: "bar" is a whole word in class="foo bar" */
	.bar { color: green; }

	/* Should match: "foobar" is the whole class value */
	.foobar { color: green; }

	/* Should match: "bar-foo" is a whole word (hyphen not whitespace) */
	.bar-foo { color: green; }

	/* Should match: "baz" is a whole word in class="bar-foo baz" */
	.baz { color: green; }

	/* Should NOT match: "foob" is not a word in any element's class */
	.foob { color: red; }

	/* Should NOT match: "afoo" is a word but "foo-x" is not "foo" */
	[class~="foo-x"] { color: green; }

	/* Attribute selector with ~= operator directly */
	[class~="afoo"] { color: green; }

	/* === Deep combinator chains (4+ levels) === */

	/* Should match: exact chain main > article > section > div > span */
	main > article > section > div > span { color: green; }

	/* Should match: descendant chain */
	main article section div span { color: green; }

	/* Should match: mixed combinators */
	main > article section > div span { color: green; }

	/* Should NOT match: wrong nesting order */
	main > article > div > section > span { color: red; }

	/* === :has() combined with other selectors === */

	/* Should match: nav.primary has <a> descendant */
	nav:has(a).primary { color: green; }

	/* Should match: nav.secondary has <button> descendant */
	nav:has(button).secondary { color: green; }

	/* Should NOT match: nav.primary doesn't have <button> */
	nav:has(button).primary { color: red; }

	/* Multiple :has() on same element */
	main:has(article):has(span) { color: green; }

	/* :has() with child combinator */
	main:has(> article) { color: green; }

	/* === Escaped selectors === */
	.a\-b { color: green; }

	/* === :is()/:where()/:not() with deep selectors === */

	/* :is() with matching selector */
	header :is(h1) { color: green; }

	/* :where() with matching selector */
	ul :where(li) { color: green; }

	/* :not() — should match span since it's not a div */
	span:not(div) { color: green; }

	/* :is() with deep combinator */
	ul :is(li > span) { color: green; }

	/* :not() with class — p.a-b is :not(.unused) */
	p:not(.unused) { color: green; }

	/* Complex: :has() + :is() */
	ul:has(li) :is(span) { color: green; }
</style>
