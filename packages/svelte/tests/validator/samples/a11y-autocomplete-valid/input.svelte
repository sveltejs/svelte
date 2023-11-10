<script>
    let dynamic = '';
</script>

<!-- VALID -->
<input type="text" />
<input type="text" autocomplete="name" />
<input type="text" autocomplete="off" />
<input type="text" autocomplete="on" />
<input type="text" autocomplete="billing family-name" />
<input type="hidden" autocomplete="section-blue shipping street-address" />
<input type="text" autocomplete="section-somewhere shipping work email" />
<input type="text" autocomplete="section-somewhere shipping work email webauthn" />
<input type="text" autocomplete="SECTION-SOMEWHERE SHIPPING WORK EMAIL WEBAUTHN" />
<input type="TEXT" autocomplete="ON" />
<input type="email" autocomplete="url" />
<input type="text" autocomplete="section-blue shipping street-address" />
<input type="hidden" autocomplete="off" />
<input type="hidden" autocomplete="on" />
<input type="text" autocomplete="" />
<input type="{dynamic}" autocomplete="" />
<input type="text" autocomplete="{dynamic}" />

<!-- INVALID -->
<input type="text" autocomplete />
<input type="text" autocomplete="incorrect" />
<input type="text" autocomplete="webauthn" />
