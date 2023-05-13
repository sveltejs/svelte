export default {
	withoutNormalizeHtml: true,
	html: get_html(false),
	ssrHtml: get_html(true)
};

function get_html(ssr) {
	// ssr rendered HTML has an extra newline prefixed within `<pre>` tag,
	// if the <pre> tag starts with `\n`
	// because when browser parses the SSR rendered HTML, it will ignore the 1st '\n' character
	return `<pre id="pre">  A
  B
  <span>
    C
    D
  </span>
  E
  F
</pre> <div id="div">A
  B
  <span>C
    D</span>
  E
  F</div> <div id="div-with-pre"><pre>    A
    B
    <span>
      C
      D
    </span>
    E
    F
  </pre></div> <div id="pre-with-leading-newline"><pre>leading newline</pre> <pre>  leading newline and spaces</pre> <pre>${
		ssr ? '\n' : ''
	}
leading newlines</pre></div> <div id="pre-without-leading-newline"><pre>without spaces</pre> <pre>  with spaces  </pre> <pre> 
newline after leading space</pre></div> <pre id="pre-with-multiple-leading-newlines">${
		ssr ? '\n' : ''
	}

multiple leading newlines</pre>`;
}
