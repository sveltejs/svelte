<a href="/" role="link">a link</a>
<article role="article"></article>
<aside role="complementary"></aside>
<body role="document"></body>
<button role="button">click me</button>
<datalist role="listbox"></datalist>
<dd role="definition"></dd>
<dfn role="term"></dfn>
<details role="group"></details>
<dialog role="dialog"></dialog>
<dt role="term"></dt>
<fieldset role="group"></fieldset>
<figure role="figure"></figure>
<form role="form" aria-label="a form">foo</form>
<!-- no accessible name, so the landmark role is meaningful rather than redundant -->
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
<!-- <menu role="list" /> allowed, same as ul/ol above -->
<nav role="navigation"></nav>
<!-- <ol role="list" /> allowed, see comment above -->
<optgroup role="group"></optgroup>
<option role="option"></option>
<output role="status"></output>
<progress role="progressbar"></progress>
<section role="region" aria-label="a region"></section>
<!-- no accessible name, so the landmark role is meaningful rather than redundant -->
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

<!-- nested asides have no implicit role, so the role is meaningful rather than redundant -->
<article><aside role="complementary"></aside></article>

<!-- Allowed -->
<!-- menu has same interactive role exceptions as ul/ol -->
<menu role="menu"></menu>

<!-- empty alt makes the img presentational, so role="img" is meaningful -->
<img alt="" role="img" />
<img alt="" role="presentation" />
<img alt="a sunset" role="img" />
