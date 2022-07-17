<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />

  <div class="recommendation-section-wrapper">
    <p class="intro">Specific steps to ensure you are effectively managing and leading in a Hybrid Workforce Model</p>
    <div class="bulleted-list">
      <h2 class="bullet-intro">Hybrid working model needs to be Leader Led:</h2>
      <ul>
        <li class="bullet">Model flexibility, wellbeing and self-care</li>
        <li class="bullet">Combat digital exhaustion from the top</li>
        <li class="bullet">Leverage the Performance Experience</li>
        <li class="bullet">Create new team norms</li>
        <li class="bullet">Understand the future Leader Framework Capabilities</li>
      </ul>
    </div>
  </div>
</div>
