<a href="/" role="link">a link</a>
<article role="article"></article>
<aside role="complementary"></aside>
<body role="document"></body>
<button role="button"></button>
<datalist role="listbox"></datalist>
<dd role="definition"></dd>
<dfn role="term"></dfn>
<details role="group"></details>
<dialog role="dialog"></dialog>
<dt role="term"></dt>
<fieldset role="group"></fieldset>
<figure role="figure"></figure>
<form role="form">foo</form>
<h1 role="heading">heading</h1>
<h2 role="heading">heading</h2>
<h3 role="heading">heading</h3>
<h4 role="heading">heading</h4>
<h5 role="heading">heading</h5>
<h6 role="heading">heading</h6>
<hr role="separator" />
<!-- <li role="listitem" /> allowed since CSS list-style none removes semantic meaning and role brings it back -->
<link role="link" />
<main role="main"></main>
<menu role="list"></menu>
<nav role="navigation"></nav>
<!-- <ol role="list" /> allowed, see comment above -->
<optgroup role="group"></optgroup>
<option role="option"></option>
<output role="status"></output>
<progress role="progressbar"></progress>
<section role="region"></section>
<summary role="button"></summary>
<table role="table"></table>
<tbody role="rowgroup"></tbody>
<textarea role="textbox"></textarea>
<tfoot role="rowgroup"></tfoot>
<thead role="rowgroup"></thead>
<tr role="row"></tr>
<!--<ul role="list" /> allowed, see comment above -->

<!-- Tested header/footer not nested in section/article -->
<header role="banner"></header>
<footer role="contentinfo"></footer>

<!-- Allowed -->
<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<menu role="menu"></menu>
