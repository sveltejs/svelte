<h1>Heading 1</h1>
<slot>
  <span>Span 1</span>
</slot>
<slot>
  <span>Span 2</span>
</slot>
<p>Paragraph 2</p>

<style>
	h1 ~ span {
		color: green;
	}

  h1 ~ p {
    color: red;
  }

	span ~ p {
		color: blue;
	}
</style>
