export default {
	html: `
		$$slots: {"aaaaa":true}
		<span slot="aaaaa">hello aaaaa</span>
		Slot abab is not available

		$$slots: {"abab":true}
		Slot aaaaa is not available

		<div><span slot="abab">hello abab</span></div>
		$$slots: {"aaaaa":true,"abab":true}
		<span slot="aaaaa">hello aaaaa</span>
		<div><span slot="abab">hello abab</span></div>
	`
};
