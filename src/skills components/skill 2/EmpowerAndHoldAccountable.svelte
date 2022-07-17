<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />

  <div class="recommendation-section-wrapper">
    <div class="bulleted-lists">
      <div class="bulleted-list">
        <h2>Consider people, process, and performance in making leadership decisions about hybrid teams.</h2>
        <ul>
          <li class="bullet">People are motivated by the protection, growth, and welfare of others.</li>
          <li class="bullet">A strong desire to help others who can genuinely benefit.</li>
          <li class="bullet">People who are motivated by tasks and process accomplishment and achieving results.</li>
          <li class="bullet">A strong desire to set goals, take decisive action, and claim earned rewards.</li>
          <li class="bullet">
            Elevate performance through meaningful order and thinking things through. A strong desire to pursue
            independent interests, to be practical, and to be fair.
          </li>
        </ul>
      </div>

      <div class="bulleted-list">
        <h2>
          Specific steps to ensure you are effectively managing and leading in a Hybrid Workforce Model - Hybrid working
          model needs to be Leader Led:
        </h2>
        <ul>
          <li class="bullet">Model flexibility, wellbeing and self-care</li>
          <li class="bullet">Combat digital exhaustion from the top</li>
          <li class="bullet">Leverage the Performance Experience</li>
          <li class="bullet">Create new team norms</li>
          <li class="bullet">Understand the future Leader Framework Capabilities</li>
        </ul>
      </div>
    </div>

    <div class="highlight-box">
      <h2>Hybrid workplace need a strong sense of personal ownership and accountability — but how do you get there?</h2>
      <ul>
        <li class="bullet">Shared goals</li>
        <li class="bullet">Teach them Vs. Clenching</li>
        <li class="bullet">Provide <span>guidance</span> on how to own and manage things</li>
        <li class="bullet">Ensure <span>psychological safety</span></li>
        <li class="bullet">Create a culture of <span>two-way feedback</span></li>
        <li class="bullet">Transparent and <span>support</span> each other</li>
        <li class="bullet">Freedom to experiment – <span>Fail fast</span></li>
        <li class="bullet">Instant <span>recognition</span> for the efforts and process</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .bulleted-lists {
    display: flex;
    gap: var(--size-10);
  }
</style>
