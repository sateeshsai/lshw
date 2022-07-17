<script>
  import { activeSection } from "./../stateStore.js";
  import { content } from "../content.js";
  import { fly, scale, slide, fade } from "svelte/transition";
</script>

<div class="skills-about-container">
  <div class="skills-about-title" on:click={() => ($activeSection = "skills")}>
    <span>Skills</span> <br /> you need
  </div>
  <div class="skills-about-list-container">
    {#each $content as skill, idx}
      <div class="skill-name-wrapper" in:fly={{ y: -10, delay: idx * 100 }}>
        <div class="idx">
          {idx + 1}
        </div>
        <div class="skill-name">
          {@html skill.nameHTML}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .skills-about-container {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: var(--color2);
    padding: 0 var(--size-12);
    gap: var(--size-10);
    color: var(--text-reverse-color);
    font-size: var(--fs5);
  }
  .skills-about-list-container {
    flex: 7;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--size-9);
  }

  .skills-about-title {
    font-size: var(--fs7);
    font-weight: 600;
    flex: 1;
    cursor: pointer;
  }

  .skills-about-title span {
    font-size: var(--fs9);
    color: var(--bright-green);
  }

  .skill-name-wrapper {
    display: flex;
    align-items: center;
    gap: var(--size-6);
    background-color: var(--color3);
    padding: var(--size-6) var(--size-9);
    border-radius: var(--size-3);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .skill-name-wrapper:hover {
    background-color: var(--bright-green);
    color: var(--text-color);
    transform: scale(1.1);
  }

  .idx {
    font-size: var(--fs8);
    font-weight: 100;
  }

  .skill-name {
    line-height: 1.5em;
  }

  :global(.skill-name span) {
    font-weight: 600;
  }

  :global(.skill-name-wrapper:hover .skill-name span) {
    font-weight: 800;
  }
</style>
