<script>
  const userdata = {
    ONCLICK: 'alert(document.cookie)',
    ONMOUSEOVER: 'alert("XSS")'
  };
</script>

<svg {...userdata}>
  <circle cx="12" cy="12" r="10" />
</svg>

<math {...userdata}>
  <mi>x</mi>
</math>

<custom-element {...userdata}></custom-element>