<script>
  import { activeSection } from "./../stateStore.js";
  import { content } from "./../content.js";
  import { crossfade, fade, fly, slide } from "svelte/transition";
  const [send, receive] = crossfade({});
  import SkillSection from "./SkillSection.svelte";

  $: tilesContent = $content.filter((skill) => skill);
  $: breadCrumbs = $content.filter((skill) => skill.active !== true);

  $: console.log({ tilesContent }, { breadCrumbs });

  let showSkillPage = false;

  function openSkill(skill) {
    $content.forEach((skill) => (skill.active = false));
    skill.active = true;
    $content = $content;
    showSkillPage = true;
  }

  $: activeSkill = $content.find((skill) => {
    $content = $content;
    return skill.active;
  });
</script>

<div class="skills-breadcrumbs-container" class:showBreadcrumbs={showSkillPage === true} in:slide>
  {#if showSkillPage}
    <div class="skills-breadcrumbs-title" on:click={() => (showSkillPage = false)} in:fly={{ x: -20 }}>Skills</div>
    <div class="skills-breadcrumbs-wrapper">
      {#each $content as skill, idx}
        <div
          class="skill-breadcrumb"
          in:receive={{ key: skill, duration: 300 }}
          out:send={{ key: skill, duration: 500 }}
        >
          <div class="idx-breadcrumb" class:activeBreadcrumb={skill.active === true} on:click={() => openSkill(skill)}>
            {skill.name}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showSkillPage}
  <div class="skill-section-container">
    {#each $content.filter((tile) => tile.active === true) as skill (skill.id)}
      <div class="skill-section-wrapper">
        <SkillSection skill={activeSkill} />
      </div>
    {/each}
  </div>
{/if}

{#if !showSkillPage}
  <div class="skills-page-container">
    <h1 class="skills-title">Skills you need</h1>
    <div class="skills-container">
      <div class="skills-gallery" in:slide>
        {#each $content as skill, idx}
          <div
            class="skill-name-wrapper"
            style="background-image: url(./images/skills/skill-{idx + 1}.svg)"
            on:click={() => openSkill(skill)}
            in:receive={{ key: skill, duration: 500 }}
            out:send={{ key: skill, duration: 500 }}
          >
            <div class="skill-index-name-wrapper">
              <div class="idx">
                {idx + 1}
              </div>
              <div class="skill-name">
                {@html skill.nameHTML}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .skills-page-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: var(--size-10) var(--size-12);
    gap: var(--size-12);
    justify-content: center;
  }

  h1 {
    font-size: var(--fs8);
  }

  h1 span {
    color: var(--bright-green);
    font-weight: 600;
  }

  .skills-container {
    display: flex;
    align-items: center;
  }

  .skills-gallery {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--size-10);
    align-items: center;
    flex: 1;
  }

  .skill-name-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--size-6);
    background-color: var(--color7);
    padding: var(--size-6) var(--size-9);
    border-radius: var(--size-3);
    transition: all 0.2s ease;
    cursor: pointer;
    min-height: 20rem;
    outline: var(--color2);
    background-size: 120%;
    position: relative;
    overflow: hidden;
    background-position: center top;
    background-repeat: no-repeat;
  }

  .skill-index-name-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(to bottom, transparent 30%, var(--color1));
    color: var(--text-reverse-color);
    transition: all 0.2s ease;
  }

  .skill-name-wrapper:hover {
    background-color: var(--bright-green);
    color: var(--text-color);
    transform: scale(1.1);
    justify-content: flex-end;
    background-size: 100%;
  }

  .skill-index-name-wrapper:hover {
    background: linear-gradient(to bottom, transparent 20%, var(--color2));
  }

  .idx {
    font-size: var(--fs8);
    font-weight: 100;
    padding: var(--size-8);
  }

  .skill-name {
    line-height: 1.5em;
    padding: var(--size-8);
    font-size: var(--size-7);
    max-width: 80%;
  }

  :global(.skill-name span) {
    font-weight: 600;
  }

  :global(.skill-name-wrapper:hover .skill-name span) {
    font-weight: 800;
  }

  .skills-breadcrumbs-container {
    display: flex;
    font-size: var(--fs1);
    font-weight: 400;
    gap: var(--size-6);
    justify-content: space-between;
    align-items: center;
    color: var(--text-reverse-color);
  }

  .showBreadcrumbs {
    background-color: var(--color2a);
    padding: var(--size-4) var(--size-10);
  }

  .skills-breadcrumbs-title {
    font-size: var(--fs4);
    font-weight: 700;
    flex: 1;
    cursor: pointer;
  }
  .skills-breadcrumbs-wrapper {
    display: flex;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: 100%;
    gap: var(--size-4);
  }

  .idx-breadcrumb {
    background-color: var(--color3a);
    border-radius: var(--size-2);
    /* width: 2rem; */
    cursor: pointer;
    display: grid;
    place-items: center;
    padding: var(--size-2) var(--size-4);
    text-align: center;
    color: var(--color6);
    line-height: 1.2em;
    transition: all 0.2s ease;
  }

  .idx-breadcrumb:hover {
    background-color: var(--bright-green);
    color: var(--text-color);
    font-weight: 600;
  }

  .activeBreadcrumb {
    background-color: var(--color4);
    color: var(--text-reverse-color);
    font-weight: 700;
  }

  .skill-section-container {
    display: flex;
    flex: 1;
  }

  .skill-section-wrapper {
    display: flex;
    flex: 1;
  }
</style>
