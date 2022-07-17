<script>
  export let iconBackgroundColor;
  export let iconColor;
  export let itemIconOpacity;
  export let iconStrokeWidth;
  import { draw } from "svelte/transition";
  export let back = true;
  let direction = back ? "" : "rotate(180deg)";
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 412 412" xml:space="preserve" style="transform: {direction}"
  ><circle cx="206" cy="206" r="206" fill={iconBackgroundColor} fill-opacity={itemIconOpacity} /><path
    in:draw={{ duration: 400 }}
    fill="none"
    stroke={iconColor}
    stroke-width={iconStrokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-miterlimit={iconStrokeWidth + iconStrokeWidth / 2}
    d="M248 309.9 120.6 203.6l122.7-101.5"
  /></svg
>
