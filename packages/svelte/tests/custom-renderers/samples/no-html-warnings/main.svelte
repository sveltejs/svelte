<script>
	let text = $state('expression in table');
	let show = $state(true);
</script>

<!-- 1. node_invalid_placement: <a> containing <a> -->
<a><a>link</a></a>

<!-- 2. node_invalid_placement: text inside <table> -->
<table>text inside table</table>

<!-- 3. node_invalid_placement: expression tag inside <table> -->
<table>{text}</table>

<!-- 4. element_invalid_self_closing_tag: self-closing non-void element -->
<div />

<!-- 5. textarea_invalid_content: textarea with both value attribute and children -->
<textarea value={text}>child</textarea>

<!-- 6. attribute_avoid_is: the `is` attribute -->
<button is="my-button">custom element</button>

<!-- 7. attribute_invalid_property_name: React-style className -->
<div className="foo">className test</div>

<!-- 8. attribute_invalid_property_name: React-style htmlFor -->
<label htmlFor="input-id">htmlFor test</label>

<!-- 9. a11y_accesskey: accesskey attribute -->
<div accesskey="s">accesskey test</div>

<!-- 10. a11y_autofocus: autofocus on input -->
<input autofocus />

<!-- 11. a11y_misplaced_scope: scope on div -->
<div scope="col">misplaced scope</div>

<!-- 12. a11y_positive_tabindex: positive tabindex -->
<div tabindex="5">positive tabindex</div>

<!-- 13. a11y_hidden: aria-hidden on heading -->
<h1 aria-hidden="true">hidden heading</h1>

<!-- 14. a11y_missing_attribute: img without alt -->
<img src="test.png" />

<!-- 15. a11y_unknown_aria_attribute: unknown aria attribute -->
<div aria-describedat="foo">unknown aria</div>

<!-- 16. a11y_no_redundant_roles: redundant role on nav -->
<nav role="navigation">redundant role</nav>

<!-- 17. a11y_figcaption_parent: figcaption outside figure -->
<figcaption>orphan figcaption</figcaption>

<!-- 18. a11y_distracting_elements: marquee -->
<marquee>distracting</marquee>

<!-- 19. a11y_consider_explicit_label: <a> without text -->
<a href="https://example.com"></a>

<!-- 20. a11y_label_has_associated_control: label without associated control -->
<label>no control</label>

<!-- 21. a11y_missing_content: empty h2 -->
<h2></h2>

<!-- 22. node_invalid_placement_ssr: invalid nesting inside conditional block -->
<div>
	{#if show}
		<tr><td>conditional nesting</td></tr>
	{/if}
</div>

<!-- 23. a11y via svelte:element: a11y warnings should also be suppressed on <svelte:element> -->
<svelte:element this={"img"} src="test.png" />
<svelte:element this={"div"} accesskey="s">accesskey on svelte:element</svelte:element>
<svelte:element this={"h1"} aria-hidden="true">hidden svelte:element heading</svelte:element>
