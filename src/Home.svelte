<script>
  import { LottiePlayer } from "@lottiefiles/svelte-lottie-player";
  import { activeSection } from "./stateStore.js";
  import CoverImage from "./UI components/coverImage.svelte";

  import { fly, scale, slide } from "svelte/transition";

  //HELLO HYBRID ANIMATION

  let speed = 1;
  let loop = true;
  let play = true;
  let showControls = false;
  let controlOptions = [
    "previousFrame",
    "playpause",
    "stop",
    "nextFrame",
    "progress",
    "frame",
    "loop",
    "spacer",
    "background",
    "snapshot",
    "zoom",
    "info",
  ];

  let autoplay = true;

  let dimensions = {
    width: 800,
    height: 800,
  };
  $: controlsLayout = showControls ? controlOptions : [];

  let renderFlag = 1;
</script>

<div class="home-container">
  <div class="left">
    <div class="cover-image-wrapper">
      <!-- <CoverImage /> -->
      <div class="lottieArea">
        <LottiePlayer
          src="https://assets7.lottiefiles.com/packages/lf20_yqgzsz3i.json"
          {autoplay}
          {loop}
          controls={false}
          renderer="svg"
          background="transparent"
          height={dimensions.height}
          width={dimensions.width}
        />
        <h1 class="hashtag" in:scale={{ start: 2, duration: 1000 }}>
          #hello
          {#each Array.from("Hybrid") as char, idx}
            <span in:fly={{ delay: idx * 100 }} class="char">{char}</span>
          {/each}
        </h1>
      </div>
    </div>
  </div>
  <div class="right">
    <div class="intro-buttons-container" in:fly={{ y: -50 }}>
      <div class="titles-container">
        <h1 class="title">Leadership skills for Hybrid Workplace <span>playbook</span></h1>
        <p class="introduction">
          The hybrid workplace model is a way of working that provides flexibility for businesses to determine the
          appropriate mix of in person (co-location) and remote interactions depending on client, talent, project and
          other business needs.
        </p>
      </div>
      <div class="action-buttons-wrapper">
        <button on:click={() => ($activeSection = "about")}> About the program </button>
        <button on:click={() => ($activeSection = "skills")}> Skills you need </button>
      </div>
    </div>
  </div>
</div>

<style>
  .home-container {
    flex: 1;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--size-3);
  }

  .left {
    justify-self: end;
    padding-left: 6rem;
    /* display: grid; */
  }

  .cover-image-wrapper {
    /* width: 50rem; */
  }

  .right {
    display: flex;
    flex-direction: column;
    gap: var(--size-12);
    line-height: 2em;
  }

  .hashtag,
  .title {
    font-weight: 100;
  }

  .titles-container {
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }

  .lottieArea {
    position: relative;
  }

  .hashtag {
    font-size: var(--fs6);
    font-style: italic;
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .title {
    font-size: var(--fs7);
    font-weight: 600;
  }

  .title span {
    color: var(--bright-green);
  }

  .hashtag span {
    font-weight: 1000;
    color: var(--bright-green);
  }

  .intro-buttons-container {
    display: flex;
    flex-direction: column;
    gap: var(--size-8);
  }

  p {
    font-size: var(--fs6);
    width: 75%;
    line-height: 1.4em;
  }

  .action-buttons-wrapper {
    display: flex;
    gap: var(--size-6);
  }

  button {
    background-color: var(--color1);
    border: none;
    margin: 0;
    cursor: pointer;
    padding: var(--size-3) var(--size-5);
    border-radius: var(--size-2);
    color: var(--text-reverse-color);
    font-weight: 700;
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: var(--bright-green);
    color: var(--tile-color);
    transform: scale(1.1);
  }
</style>
