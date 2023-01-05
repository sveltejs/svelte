<!-- ALL INVALID: HTML elements with interactive role  -->
<article role="button" />
<aside role="checkbox" aria-checked={false} />
<blockquote role="columnheader" />
<body role="combobox" aria-controls={[]} aria-expanded />
<br role="grid" />
<caption role="gridcell" />
<dd role="link" />
<details role="listbox" />
<dir role="menu" />
<dl role="menubar" />
<dfn role="menuitem" />
<dt role="menuitemcheckbox" aria-checked />
<fieldset role="menuitemradio" aria-checked />
<figure>
  <figcaption role="menuitemradio" aria-checked />
</figure>
<figure role="option" aria-selected />
<footer role="radio" aria-checked />
<form role="radiogroup" />
<frame role="row" />
<h1 role="rowheader">Button</h1>
<h2 role="scrollbar" aria-controls={[]} aria-valuenow={0} >Button</h2>
<h3 role="searchbox">Button</h3>
<h4 role="slider" aria-valuenow={0}>Button</h4>
<h5 role="spinbutton">Button</h5>
<h6 role="switch" aria-checked>Button</h6>
<hr role="tab" />
<iframe role="tablist" title="tablist" />
<img role="tabpanel" alt="tabpanel" />
<label role="textbox" />
<legend role="toolbar" />
<li role="tree" />
<main role="treegrid" />
<mark role="treeitem" aria-selected />
<marquee role="doc-backlink" />
<menu role="doc-biblioref" />
<meter role="doc-glossref" />
<nav role="doc-noteref" />
<ol role="button" />
<optgroup role="treeitem" aria-selected />
<output role="treegrid" />
<p role="columnheader" />
<pre role="tree" />
<progress role="combobox" aria-controls={[]} aria-expanded />
<ruby role="toolbar" />
<section role="radio" aria-label="radio" aria-checked />
<table role="menu" />
<tbody role="searchbox" />
<td role="button" />
<tfoot role="listbox" />
<thead role="slider" aria-valuenow={0} />
<time role="doc-backlink" />
<ul role="spinbutton" />

<!-- VALID under recommended settings, INVALID under strict settings: ul, ol, li has interactive roles -->
<!-- ul -->
<ul role="menu" />
<ul role="menubar" />
<ul role="radiogroup" />
<ul role="tablist" />
<ul role="tree" />
<ul role="treegrid" />
<!-- ol -->
<ol role="menu" />
<ol role="menubar" />
<ol role="radiogroup" />
<ol role="tablist" />
<ol role="tree" />
<ol role="treegrid" />
<!-- li -->
<li role="tab" />
<li role="menuitem" />
<li role="row" />
<li role="treeitem" aria-selected={false} />

<!-- VALID: HTML elements attributed with an interactive role -->
<div role="button" />
<div role="menu" />
<div role="tab" />
<div role="textbox" />

<!-- VALID: HTML elements attributed with a non-interactive role -->
<div role="alert" />
<div role="document" />
<div role="separator" />
<div role="timer" />
