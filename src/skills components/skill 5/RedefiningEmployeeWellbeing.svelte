<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="recommendation-section-wrapper">
    <p class="intro">
      Prior to being locked in their homes, employees had several avenues to balance out work stress, such as reasonable
      work hours, human connections in the workplace, water cooler talks, and also the daily commute which served as a
      buffer between work and personal lives. Hybrid and remote workspaces have nearly eliminated these stress
      diffusers, thus inevitably forcing leaders to take up transformative actions to support employees and reduce
      stressors in the new workplace.
    </p>
    <div class="bulleted-list">
      <h2 class="bullet-intro">Recommendations</h2>
      <ul>
        <li class="bullet">
          Balance out the hybrid model guidelines and individual preferences to ensure meaningful collaboration
        </li>
        <li class="bullet">Streamline communication to facilitate human connection</li>
        <li class="bullet">Create comprehensive employee wellness programs?</li>
        <li class="bullet">Adjust employee benefits to the new reality</li>
      </ul>
    </div>
    <div class="resources-title-container">
      <h2>Relevant trainings/ references</h2>
      <div class="resources-container">
        <div class="resource">
          <a
            href="https://www.linkedin.com/learning/how-leaders-can-connect-empathy-and-results/what-empathy-is-what-it-isn-t-and-why-it-matters?autoplay=false&SSO=1504"
            target="_blank">Hybrid Leader: Connecting Empathy and Results</a
          >
        </div>
        <div class="resource">
          <a
            href="https://www.linkedin.com/learning/coaching-virtually/find-informal-coachable-moments-while-virtual?autoplay=false&SSO=1504"
            target="_blank">How to find informal coaching moments</a
          >
        </div>
      </div>
    </div>
  </div>
</div>
