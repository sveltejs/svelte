<!-- ALL INVALID: HTML elements with interactive role  -->
<article role="button"></article>
<aside role="checkbox" aria-checked={false}></aside>
<blockquote role="columnheader"></blockquote>
<br role="grid" />
<caption role="gridcell"></caption>
<dd role="link"></dd>
<details role="listbox"></details>
<dir role="menu"></dir>
<dl role="menubar"></dl>
<dfn role="menuitem"></dfn>
<dt role="menuitemcheckbox" aria-checked="true"></dt>
<fieldset role="menuitemradio" aria-checked="true"></fieldset>
<figure>
	<figcaption role="menuitemradio" aria-checked="true"></figcaption>
</figure>
<figure role="option" aria-selected="true"></figure>
<footer role="radio" aria-checked="true"></footer>
<form role="radiogroup"></form>
<h1 role="rowheader">Button</h1>
<h2 role="scrollbar" aria-controls={[]} aria-valuenow={0}>Button</h2>
<h3 role="searchbox">Button</h3>
<h4 role="slider" aria-valuenow={0}>Button</h4>
<h5 role="spinbutton">Button</h5>
<h6 role="switch" aria-checked="true">Button</h6>
<hr role="tab" />
<img role="tabpanel" alt="tabpanel" />
<label role="textbox"></label>
<legend role="toolbar"></legend>
<li role="tree"></li>
<main role="treegrid"></main>
<mark role="treeitem" aria-selected="true"></mark>
<marquee role="doc-backlink"></marquee>
<menu role="doc-biblioref"></menu>
<meter role="doc-glossref"></meter>
<nav role="doc-noteref"></nav>
<ol role="button"></ol>
<optgroup role="treeitem" aria-selected="true"></optgroup>
<output role="treegrid"></output>
<p role="columnheader"></p>
<pre role="tree"></pre>
<progress role="combobox" aria-controls={[]} aria-expanded="true"></progress>
<ruby role="toolbar"></ruby>
<section role="radio" aria-label="radio" aria-checked="true"></section>
<table role="menu"></table>
<tbody role="searchbox"></tbody>
<tfoot role="listbox"></tfoot>
<thead role="slider" aria-valuenow={0}></thead>
<time role="doc-backlink"></time>
<ul role="spinbutton"></ul>

<!-- VALID under recommended settings, INVALID under strict settings: ul, ol, li has interactive roles -->
<!-- ul -->
<ul role="menu"></ul>
<ul role="menubar"></ul>
<ul role="radiogroup"></ul>
<ul role="tablist"></ul>
<ul role="tree"></ul>
<ul role="treegrid"></ul>
<!-- ol -->
<ol role="menu"></ol>
<ol role="menubar"></ol>
<ol role="radiogroup"></ol>
<ol role="tablist"></ol>
<ol role="tree"></ol>
<ol role="treegrid"></ol>
<!-- li -->
<li role="tab"></li>
<li role="menuitem"></li>
<li role="row"></li>
<li role="treeitem" aria-selected={false}></li>

<!-- VALID: elements assigned an interactive role. -->
<div role="button"></div>
<div role="checkbox" aria-checked={true}></div>
<div role="columnheader"></div>
<div role="combobox" aria-controls={[]} aria-expanded={true}></div>
<div role="grid"></div>
<div role="gridcell"></div>
<div role="link"></div>
<div role="listbox"></div>
<div role="menu"></div>
<div role="menubar"></div>
<div role="menuitem"></div>
<div role="menuitemcheckbox" aria-checked="true"></div>
<div role="menuitemradio" aria-checked="true"></div>
<div role="option" aria-selected="true"></div>
<div role="progressbar"></div>
<div role="radio" aria-checked="true"></div>
<div role="radiogroup"></div>
<div role="row"></div>
<div role="rowheader"></div>
<div role="scrollbar" aria-controls={[]} aria-valuenow={0}></div>
<div role="searchbox"></div>
<div role="slider" aria-valuenow={0}></div>
<div role="spinbutton"></div>
<div role="switch" aria-checked="true"></div>
<div role="tab"></div>
<div role="textbox"></div>
<div role="treeitem" aria-selected={true}></div>
<body role="combobox" aria-controls={[]} aria-expanded="true"></body>
<td role="button"></td>

<!-- VALID: HTML elements attributed with a non-interactive role -->
<div role="alert"></div>
<div role="document"></div>
<div role="separator"></div>
<div role="timer"></div>
<frame role="row"></frame>
