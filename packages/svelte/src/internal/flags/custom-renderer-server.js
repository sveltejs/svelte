import * as e from '../shared/errors.js';

// This module is injected by the compiler into every component when the custom
// renderer feature is enabled. It is only ever imported as a package specifier
// (`svelte/internal/flags/custom-renderer`) from compiled client output, which
// must run where Svelte's client build is available — i.e. with the `browser`
// or `custom-renderer` resolve condition set. If we end up here, the component
// is running in a server context without that condition, so fail fast with the
// same descriptive error as `svelte/renderer`.
e.custom_renderer_unavailable_on_server();
