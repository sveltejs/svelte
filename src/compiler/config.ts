export const test = typeof Deno !== 'undefined' && typeof Deno.env.get("TEST") !== "undefined";
