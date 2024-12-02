<script>
</script>

<div
  ongotpointercapture={(e) => {
    e.target.dataset.gotCaptured = "true";
  }}
  onlostpointercapture={(e) => {
	e.target.dataset.lostCaptured = "true";
  }}
>
</div>

