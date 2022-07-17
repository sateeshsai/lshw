<script>
  import { onMount } from "svelte";
  export let skill = undefined;
  import { fly, scale, slide, fade, crossfade } from "svelte/transition";
  const [send, receive] = crossfade({});

  onMount(() => {
    console.log("mounted");
  });

  let showRecommendationFlag = false;

  let recommendationToShow = undefined;

  function showRecommendation(recommendation) {
    skill.recommendations.forEach((rec) => (rec.active = false));
    showRecommendationFlag = !showRecommendationFlag;
    recommendationToShow = recommendation;
    recommendation.active = true;
    skill = skill;
  }

  $: activeRecommendationArray = skill.recommendations.filter((rec) => rec.active === true);

  function hideRecommendation() {
    skill.recommendations.forEach((rec) => (rec.active = false));
    showRecommendationFlag = !showRecommendationFlag;
  }

  let recommendationsHeight = undefined;

  function reportDimensions(node) {
    console.log(node);
    console.log(node.children.length);
    console.log(node.getBoundingClientRect(), node.offsetHeight);
    recommendationsHeight = node.getBoundingClientRect().height;
    console.log(recommendationsHeight);

    return {
      //add delete function
    };
  }
</script>

<div class="skill-section-container">
  <!-- <div class="idx">
    {skill.id}
  </div> -->
  <div class="skill-name-desc-wrapper">
    <div class="skill-name-engagement-container">
      <h1 class="skill-name" in:fly={{ x: -20 }}>
        {@html skill.nameHTML}
      </h1>
      <div class="engagement-buttons">ENGAGEMENT BUTTONS HERE</div>
    </div>
    <div class="description">
      {@html skill.description}
    </div>
  </div>
  <div class="top">
    <div class="top-left">
      <div class="comic-wrapper" in:scale>
        <img src="./images/comic_{skill.id}.png" alt="comic" />
      </div>
    </div>
    <div class="top-middle">
      <div class="stats-title">Statistically speaking...</div>
      <div class="stats-container">
        {#each skill.stats as stat}
          <div class="stat-wrapper">
            <div class="icon">O</div>
            <div class="stat">
              {@html stat}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="middle" in:fly={{ x: -20 }}>
    <div class="intro">
      {@html skill.introText}
    </div>
    <ul class="intro-bullets-container">
      {#each skill.introBullets as bullet, idx}
        <div class="intro-bullet-wrapper" in:fly={{ y: -20, delay: 200 * idx }}>
          <div class="icon">IC</div>
          <div class="intro-bullet">
            {@html bullet}
          </div>
        </div>
      {/each}
    </ul>
  </div>
  <div class="bottom">
    <h2 class="recommendations-title">Recommendations and best practices</h2>
    <div class="recommendations-and-component-container" style="height: {recommendationsHeight || 'auto'}px">
      {#if !showRecommendationFlag}
        <div class="recommendations-container" use:reportDimensions>
          {#each skill.recommendations as recommendation (recommendation)}
            <div
              class="recommendation-wrapper"
              in:receive={{ key: recommendation, duration: 500 }}
              out:send={{ key: recommendation, duration: 500 }}
            >
              <div class="icon">IC</div>
              <div class="recommendation">
                {@html recommendation.name}
                {#if recommendation.component}
                  <button on:click={() => showRecommendation(recommendation)}>More.</button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="recommendations-component-container" use:reportDimensions>
          {#each activeRecommendationArray as recommendation (recommendation)}
            <div
              class="active-recommendation-component-wrapper"
              in:receive={{ key: recommendation, duration: 500 }}
              out:send={{ key: recommendation, duration: 500 }}
            >
              <svelte:component this={recommendation.component} {recommendation} on:back={hideRecommendation} />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="additional-container">Additional content here</div>
</div>

<style>
  .skill-section-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: var(--fs4);
    /* gap: var(--size-10); */
    font-size: var(--fs5);
  }

  .skill-name-desc-wrapper {
    padding: var(--size-10) var(--size-10) var(--size-8) var(--size-10);
    display: flex;
    flex-direction: column;
    gap: var(--size-8);
  }

  .skill-name {
    font-size: var(--fs8);
  }

  .skill-name-engagement-container {
    display: flex;
    justify-content: space-between;
  }

  :global(.skill-name span) {
    font-weight: 600;
  }

  .top,
  .middle,
  .bottom {
    display: flex;
  }

  .top {
    display: grid;
    grid-template-columns: 5fr 3fr;
    justify-content: center;
    gap: var(--size-8);
    padding: var(--size-3) var(--size-10) var(--size-10) var(--size-10);
  }

  .top-left {
    display: flex;
    flex-direction: column;
    gap: var(--size-8);
  }

  .description {
    font-size: var(--fs6);
    font-weight: 300;
  }

  .comic-wrapper {
    flex: 1;
  }

  .comic-wrapper img {
    width: 100%;
    border-radius: var(--size-3);
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  }

  .top-middle {
    background-color: white;
    border-radius: var(--size-3);
    padding: var(--size-9);
    display: flex;
    flex-direction: column;
    gap: var(--size-5);
    line-height: 1.2em;
  }

  .stats-title {
    font-size: var(--fs6);
    font-weight: 700;
    color: var(--bright-green);
  }

  .stats-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    /* flex-direction: column; */
    gap: var(--size-7);
    font-size: var(--fs4);
  }

  .stats-container .icon {
    background-color: var(--color3);
  }

  .recommendations-container .icon {
    background-color: var(--color4);
  }

  .stat-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-5);
    background-color: var(--color8);
    border-radius: var(--size-3);
  }

  :global(.stat span) {
    font-weight: 700;
  }

  :global(.icon) {
    color: var(--color6);
    height: 3rem;
    width: 3rem;
    border-radius: 10rem;
    background-color: var(--bright-green);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    aspect-ratio: 1/1;
  }

  .top-right {
    background-color: var(--color4);
    border-radius: var(--size-3);
    padding: 3rem;
    color: var(--text-reverse-color);
  }

  .middle {
    background-color: var(--color3);
    color: var(--text-reverse-color);
    padding: var(--size-11) var(--size-10);
    flex-direction: column;
    gap: var(--size-6);
    line-height: 1.4em;
  }

  :global(.intro span) {
    color: var(--bright-green);
  }

  ul {
    list-style-type: disc;
    list-style-position: inside;
  }

  .intro-bullets-container {
    display: flex;
    gap: var(--size-12);
  }

  .intro-bullet-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 0.2rem solid var(--color4);
    border-radius: var(--size-3);
    padding: var(--size-6);
    gap: var(--size-5);
    flex: 1;
  }

  .bottom {
    flex-direction: column;
    padding: var(--size-11) var(--size-10);
    gap: var(--size-9);
  }

  h2 {
    font-size: var(--fs6);
    font-weight: 700;
  }

  .recommendations-and-component-container {
    position: relative;
    display: grid;
    grid-template-areas: "title" "recommendations";
  }

  .recommendations-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(auto, 1fr);
    gap: var(--size-9);
    position: absolute;
    /* grid-area: recommendations; */
  }

  .recommendation-wrapper {
    background-color: var(--color8);
    padding: var(--size-6);
    border-radius: var(--size-3);
    line-height: 1.3em;
    display: flex;
    align-items: center;
    gap: var(--size-6);
    transition: all 0.2s ease;
  }

  .recommendation-wrapper:hover {
    background-color: var(--color1);
    color: var(--text-reverse-color);
  }

  .recommendation {
    font-weight: 300;
  }

  :global(.recommendation span) {
    font-weight: 600;
  }

  .recommendation button {
    font-size: var(--fs4);
    font-weight: 600;
    padding: var(--size-1) var(--size-3);
    background-color: var(--color5);
    width: fit-content;
    margin-top: var(--size-3);
    border-radius: var(--size-2);
    color: var(--text-reverse-color);
  }

  .recommendations-component-container {
    position: absolute;
    width: 100%;
    /* grid-area: recommendations; */
  }

  .additional-container {
    padding: var(--size-11) var(--size-10);
    background-color: var(--color8);
  }

  .recommendations-component-container {
    display: flex;
    flex: 1;
  }
  .active-recommendation-component-wrapper {
    display: flex;
    flex: 1;
  }
</style>
