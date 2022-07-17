<script>
  import Illustration1 from "./Illustration1.svelte";
  import Illustration2 from "./Illustration2.svelte";
  import Illustration3 from "./Illustration3.svelte";
  import Illustration4 from "./Illustration4.svelte";
  import Illustration1Color from "./Illustration1Color.svelte";
  import Illustration2Color from "./Illustration2Color.svelte";
  import Illustration3Color from "./Illustration3Color.svelte";
  import Illustration4Color from "./Illustration4Color.svelte";
  import SkillsAbout from "./SkillsAbout.svelte";
  import { fly, scale, slide, fade } from "svelte/transition";
</script>

<div class="about-container">
  <div class="top">
    <div class="left" in:slide>
      <h1>Adapt to <span>evolving expectations</span></h1>
      <div class="description">
        <p>
          The hybrid workplace model is a way of working that provides flexibility for businesses to determine the
          appropriate mix of in person (co-location) and remote interactions depending on client, talent, project and
          other business needs.
        </p>
        <p>
          The model is still evolving, subject to talent model, role, workstream, industry, group, and type of
          engagement. However, we are starting to experience the benefits from colocation including leadership
          interactions, project meetings, all-hands meetings (AHMs), talent matters, in-person group trainings, client
          visits and more.
        </p>
        <p>
          On the other hand, hybrid work model is reshaping the expectations of professionals. Leaders/People managers
          are placed at the convergence of professionals, technology, and locations and play a vital role in fostering
          well-being, sustaining performance, and navigating this changing landscape.
        </p>
      </div>
    </div>
    <div class="right">
      <div class="illustration-container-wrapper" in:fade>
        <div class="illustration-container illustrations">
          <div class="illustration-wrapper illustration1">
            <img class="illustration-1" src="./images/1.svg" alt="" />
            <img class="illustration-1-color" src="./images/1c.svg" alt="" />
            <div class="illustration-bg">
              Suspendisse blandit sem eu nunc aliquam, non vestibulum nisl euismod. Sed at velit vitae orci facilisis
              convallis.
            </div>
          </div>
          <div class="illustration-wrapper illustration2">
            <img class="illustration-2" src="./images/2.svg" alt="" />
            <img class="illustration-2-color" src="./images/2c.svg" alt="" />
            <div class="illustration-bg">
              Suspendisse blandit sem eu nunc aliquam, non vestibulum nisl euismod. Sed at velit vitae orci facilisis
              convallis.
            </div>
          </div>
          <div class="illustration-wrapper illustration3">
            <img class="illustration-3" src="./images/3.svg" alt="" />
            <img class="illustration-3-color" src="./images/3c.svg" alt="" />
            <div class="illustration-bg">
              Suspendisse blandit sem eu nunc aliquam, non vestibulum nisl euismod. Sed at velit vitae orci facilisis
              convallis.
            </div>
          </div>
          <div class="illustration-wrapper illustration4">
            <img class="illustration-4" src="./images/4.svg" alt="" />
            <img class="illustration-4-color" src="./images/4c.svg" alt="" />
            <div class="illustration-bg">
              Suspendisse blandit sem eu nunc aliquam, non vestibulum nisl euismod. Sed at velit vitae orci facilisis
              convallis.
            </div>
          </div>
        </div>

        <div class="metronome-circle-wrapper">
          <div class="metronome-needle-wrapper">
            <div class="metronome-needle">X</div>
          </div>
          <div class="metronome-circle">♫</div>
        </div>
      </div>

      <!-- <div class="illustration-container illustration-text">
      <div class="illustration-wrapper illustration1">
        <div class="illustration-bg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse blandit sem eu nunc aliquam, non
          vestibulum nisl euismod. Sed at velit vitae orci facilisis convallis.
        </div>
      </div>
      <div class="illustration-wrapper illustration2">
        <div class="illustration-bg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse blandit sem eu nunc aliquam, non
          vestibulum nisl euismod. Sed at velit vitae orci facilisis convallis.
        </div>
      </div>
      <div class="illustration-wrapper illustration3">
        <div class="illustration-bg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse blandit sem eu nunc aliquam, non
          vestibulum nisl euismod. Sed at velit vitae orci facilisis convallis.
        </div>
      </div>
      <div class="illustration-wrapper illustration4">
        <div class="illustration-bg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse blandit sem eu nunc aliquam, non
          vestibulum nisl euismod. Sed at velit vitae orci facilisis convallis.
        </div>
      </div>
    </div> -->
    </div>
  </div>
  <div class="bottom">
    <SkillsAbout />
  </div>
</div>

<style>
  .about-container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .top {
    display: grid;
    grid-template-columns: 2fr 3fr;
    padding: var(--size-9) var(--size-12);
    align-items: center;
    gap: var(--size-12);
    flex: 2;
  }

  .bottom {
    display: flex;
    flex: 2;
  }

  .left {
    font-size: var(--fs5);
    line-height: 1.3em;
    display: flex;
    flex-direction: column;
    gap: var(--size-10);
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: var(--size-12);
  }

  h1 {
    font-size: var(--fs8);
  }

  h1 span {
    font-weight: 700;
    color: var(--bright-green);
  }

  .description {
    display: flex;
    flex-direction: column;
    gap: var(--size-7);
  }

  .illustration-container-wrapper {
    padding: var(--size-6) var(--size-6) var(--size-12) var(--size-6);
    background-image: linear-gradient(to bottom, transparent, var(--color2), var(--color2));
    border-radius: var(--size-4);
    position: relative;
  }

  .metronome-circle-wrapper {
    width: 4rem;
    height: 4rem;
    background-color: var(--color2);
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 10rem;
    z-index: 99;
    padding: var(--size-5);
    animation: swing-needle 1s infinite alternate ease-in-out;
    display: flex;
    flex-direction: column;
  }

  .metronome-circle {
    height: 100%;
    width: 100%;
    border-radius: 10rem;
    background-image: radial-gradient(var(--color4), var(--color3));
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: var(--fs5);
    color: var(--text-reverse-color);
    z-index: 2;
  }

  .metronome-needle-wrapper {
    background-color: var(--bright-green);
    opacity: 0.5;
    height: 80%;
    bottom: 70%;
    left: 50%;
    transform: translateX(-50%) rotate(0deg);
    transform-origin: bottom;
    /* animation: swing-needle 0.5s infinite alternate ease-in-out; */
    z-index: 1;
    position: absolute;
    height: 30rem;
    background-image: linear-gradient(to bottom, transparent, var(--color2), var(--color2));
  }

  @keyframes swing-needle {
    0% {
      transform: translateX(-50%) rotate(-75deg);
    }

    100% {
      transform: translateX(-50%) rotate(75deg);
    }
  }

  @keyframes swing-circle {
    0% {
      transform: translateX(-50%) rotate(-25deg);
    }

    100% {
      transform: translateX(-50%) rotate(25deg);
    }
  }

  .illustration-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    flex: 1;
    gap: var(--size-6);
    background-image: linear-gradient(to bottom, transparent, var(--text-reverse-color));
    padding: var(--size-6) var(--size-6);
    border-radius: 0 0 var(--size-3) var(--size-3);
  }

  .illustration-wrapper {
    position: relative;
    display: grid;
    grid-template-areas: "illustration";
  }

  img {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -40%;
    grid-area: illustration;
    width: 100%;
    transition: all 0.2s ease;
  }

  .illustration-bg {
    background-image: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.9),
      white
    );
    grid-area: illustration;
    font-size: var(--fs4);
    line-height: 1.2em;
    min-height: 10rem;
    padding: 10rem var(--size-6) var(--size-6) var(--size-6);
    z-index: 99;
    border-radius: 0 0 var(--size-3) var(--size-3);
  }

  .illustration-1,
  .illustration-1-color {
    left: 60%;
    transform: translateX(-60%);
    width: 120%;
  }

  .illustration-1:hover {
    opacity: 0;
  }

  .illustration-1.color-illustration:hover {
    /* opacity: 0; */
  }
</style>
