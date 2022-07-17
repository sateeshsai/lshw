<script>
  import { draw } from "svelte/transition";
  export let strokeColor;
  export let strokeWidth;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128.63 83.18"
  ><g
    ><g
      ><path
        d="M2.5 41.59h119.05M87.04 2.5l39.09 39.09-39.09 39.09"
        style="fill: none;
        stroke: {strokeColor};
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: {strokeWidth};"
        in:draw={{ duration: 500 }}
      /></g
    ></g
  ></svg
>

<style>
</style>
