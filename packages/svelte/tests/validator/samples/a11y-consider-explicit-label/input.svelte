<button></button>
<a href="/#"><b></b></a>

<button aria-label="Valid empty button"></button>
<a href="/#" aria-label="Valid empty link"></a>

<button title="Valid empty button"></button>
<a href="/#" title="Valid empty link"></a>

<button aria-hidden='true'></button>
<button inert></button>
<a href="/#" aria-hidden='true'><b></b></a>

<button>Click me</button>
<a href="/#">Link text</a>
<a href="/#"><img src="./icon.svg" alt="Link text"></a>

<select>
	<!-- valid if button contains <selectedcontent> -->
	<button>
		<selectedcontent></selectedcontent>
	</button>

	<option>one</option>
	<option>two</option>
	<option>three</option>
</select>
