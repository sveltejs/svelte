// TODO we may, on a best-effort basis, reimplement some of the legacy private APIs here so that certain libraries continue to work. Those APIs will be marked as deprecated (and should noisily warn the user) and will be removed in a future version of Svelte.

throw new Error(
	`Your application, or one of its dependencies, imported from 'svelte/internal', which was a private module used by Svelte 4 components that no longer exists in Svelte 5. It is not intended to be public API. If you're a library author and you used 'svelte/internal' deliberately, please raise an issue on https://github.com/sveltejs/svelte/issues detailing your use case.`
);
