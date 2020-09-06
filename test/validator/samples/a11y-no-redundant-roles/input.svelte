<!-- should not warn -->
<article role="feed" />
<aside role="region" />
<button role="radio" />
<form role="search">foo</form>
<h1 role="presentation">foo</h1>
<section role="contentinfo">foo</section>

<!-- should warn -->
<article role="article" />
<aside role="complementary" />
<button role="button" />
<form role="form">foo</form>
<h1 role="heading">foo</h1>
<section role="region">foo</section>
