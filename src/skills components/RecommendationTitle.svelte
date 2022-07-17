<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let title = undefined;

  function dispatchBackEvent() {
    dispatch("back");
  }
</script>

<div class="skill-title-container">
  <div class="title-back-wrapper">
    <button on:click={dispatchBackEvent}>Back</button>
    <h1 class="skill-title">
      {title}
    </h1>
  </div>
  <div class="engagement-buttons">ENGAGEMENT BUTTONS HERE</div>
</div>

<style>
  .skill-title-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--size-5);
  }

  .title-back-wrapper {
    display: flex;
    gap: var(--size-5);
    color: var(--bright-green);
    font-weight: 700;
    font-size: var(--fs6);
  }

  .engagement-buttons {
    color: var(--color6);
  }
</style>
