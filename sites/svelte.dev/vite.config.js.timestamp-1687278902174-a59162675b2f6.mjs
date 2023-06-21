// vite.config.js
import { sveltekit } from "file:///Users/puruvijay/Projects/svelte/node_modules/.pnpm/@sveltejs+kit@1.20.4_svelte@packages+svelte_vite@4.3.9/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import * as fs from "fs";
var plugins = [raw([".ttf"]), sveltekit()];
if (!process.versions.webcontainer) {
  plugins.push(
    (await import("file:///Users/puruvijay/Projects/svelte/node_modules/.pnpm/vite-imagetools@5.0.4/node_modules/vite-imagetools/dist/index.js")).imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has("big-image")) {
          return new URLSearchParams("w=640;1280;2560;3840&format=avif;webp;png&as=picture");
        }
        return new URLSearchParams();
      }
    })
  );
}
function raw(ext) {
  return {
    name: "vite-plugin-raw",
    transform(_, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return { code: `export default ${JSON.stringify(buffer)}`, map: null };
      }
    }
  };
}
var config = {
  logLevel: "info",
  plugins,
  optimizeDeps: {
    exclude: ["@sveltejs/site-kit", "@sveltejs/repl"]
  },
  ssr: { noExternal: ["@sveltejs/site-kit", "@sveltejs/repl"] },
  server: {
    fs: {
      strict: false
    }
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcHVydXZpamF5L1Byb2plY3RzL3N2ZWx0ZS9zaXRlcy9zdmVsdGUuZGV2XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcHVydXZpamF5L1Byb2plY3RzL3N2ZWx0ZS9zaXRlcy9zdmVsdGUuZGV2L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wdXJ1dmlqYXkvUHJvamVjdHMvc3ZlbHRlL3NpdGVzL3N2ZWx0ZS5kZXYvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBwbHVnaW5zID0gW3JhdyhbJy50dGYnXSksIHN2ZWx0ZWtpdCgpXTtcblxuLy8gT25seSBlbmFibGUgc2hhcnAgaWYgd2UncmUgbm90IGluIGEgd2ViY29udGFpbmVyIGVudlxuaWYgKCFwcm9jZXNzLnZlcnNpb25zLndlYmNvbnRhaW5lcikge1xuXHRwbHVnaW5zLnB1c2goXG5cdFx0KGF3YWl0IGltcG9ydCgndml0ZS1pbWFnZXRvb2xzJykpLmltYWdldG9vbHMoe1xuXHRcdFx0ZGVmYXVsdERpcmVjdGl2ZXM6ICh1cmwpID0+IHtcblx0XHRcdFx0aWYgKHVybC5zZWFyY2hQYXJhbXMuaGFzKCdiaWctaW1hZ2UnKSkge1xuXHRcdFx0XHRcdHJldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKCd3PTY0MDsxMjgwOzI1NjA7Mzg0MCZmb3JtYXQ9YXZpZjt3ZWJwO3BuZyZhcz1waWN0dXJlJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdCk7XG59XG5cbi8qKiBcbiAqIEBwYXJhbSB7c3RyaW5nW119IGV4dFxuICogQHJldHVybnMge2ltcG9ydChcInZpdGVcIikuUGx1Z2lufSBcbiAqL1xuZnVuY3Rpb24gcmF3KGV4dCkge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6ICd2aXRlLXBsdWdpbi1yYXcnLFxuXHRcdHRyYW5zZm9ybShfLCBpZCkge1xuXHRcdFx0aWYgKGV4dC5zb21lKChlKSA9PiBpZC5lbmRzV2l0aChlKSkpIHtcblx0XHRcdFx0Y29uc3QgYnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKGlkKTtcblx0XHRcdFx0cmV0dXJuIHsgY29kZTogYGV4cG9ydCBkZWZhdWx0ICR7SlNPTi5zdHJpbmdpZnkoYnVmZmVyKX1gLCBtYXA6IG51bGwgfTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCd2aXRlJykuVXNlckNvbmZpZ30gKi9cbmNvbnN0IGNvbmZpZyA9IHtcblx0bG9nTGV2ZWw6ICdpbmZvJyxcblx0cGx1Z2lucyxcblx0b3B0aW1pemVEZXBzOiB7XG5cdFx0ZXhjbHVkZTogWydAc3ZlbHRlanMvc2l0ZS1raXQnLCAnQHN2ZWx0ZWpzL3JlcGwnXVxuXHR9LFxuXHRzc3I6IHsgbm9FeHRlcm5hbDogWydAc3ZlbHRlanMvc2l0ZS1raXQnLCAnQHN2ZWx0ZWpzL3JlcGwnXSB9LFxuXHRzZXJ2ZXI6IHtcblx0XHRmczoge1xuXHRcdFx0c3RyaWN0OiBmYWxzZVxuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxVSxTQUFTLGlCQUFpQjtBQUMvVixZQUFZLFFBQVE7QUFFcEIsSUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUczQyxJQUFJLENBQUMsUUFBUSxTQUFTLGNBQWM7QUFDbkMsVUFBUTtBQUFBLEtBQ04sTUFBTSxPQUFPLDZIQUFpQixHQUFHLFdBQVc7QUFBQSxNQUM1QyxtQkFBbUIsQ0FBQyxRQUFRO0FBQzNCLFlBQUksSUFBSSxhQUFhLElBQUksV0FBVyxHQUFHO0FBQ3RDLGlCQUFPLElBQUksZ0JBQWdCLHNEQUFzRDtBQUFBLFFBQ2xGO0FBRUEsZUFBTyxJQUFJLGdCQUFnQjtBQUFBLE1BQzVCO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUNEO0FBTUEsU0FBUyxJQUFJLEtBQUs7QUFDakIsU0FBTztBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sVUFBVSxHQUFHLElBQUk7QUFDaEIsVUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRztBQUNwQyxjQUFNLFNBQVksZ0JBQWEsRUFBRTtBQUNqQyxlQUFPLEVBQUUsTUFBTSxrQkFBa0IsS0FBSyxVQUFVLE1BQU0sS0FBSyxLQUFLLEtBQUs7QUFBQSxNQUN0RTtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0Q7QUFHQSxJQUFNLFNBQVM7QUFBQSxFQUNkLFVBQVU7QUFBQSxFQUNWO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDYixTQUFTLENBQUMsc0JBQXNCLGdCQUFnQjtBQUFBLEVBQ2pEO0FBQUEsRUFDQSxLQUFLLEVBQUUsWUFBWSxDQUFDLHNCQUFzQixnQkFBZ0IsRUFBRTtBQUFBLEVBQzVELFFBQVE7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNILFFBQVE7QUFBQSxJQUNUO0FBQUEsRUFDRDtBQUNEO0FBRUEsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
