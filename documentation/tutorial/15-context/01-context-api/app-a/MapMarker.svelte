<script>
	import { mapbox } from './mapbox.js';

	// ...get the context here

	export let lat;
	export let lon;
	export let label;

	const popup = new mapbox.Popup({ offset: 25 }).setText(label);

	const marker = new mapbox.Marker().setLngLat([lon, lat]).setPopup(popup).addTo(map);
</script>
