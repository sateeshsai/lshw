<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="recommendation-section-wrapper">
    <div class="bulleted-list">
      <h2 class="bullet-intro">
        Employees experiencing FOMO are generally remote workers who may feel they are missing out on chance meetings in
        the hallways, chats around the water cooler
      </h2>
      <ul>
        <li class="bullet">
          <span> Lack of interaction causes employees to fear the potential of being overlooked for promotions</span> – Manager
          should effectively communicate the process and reassure employees about their career paths
        </li>
        <li class="bullet">
          <span>Create face time</span> - Attend team meetings in person, participating in training sessions and scheduling
          monthly face-to-face time with appropriate leaders/managers, mentors or peers.
        </li>
        <li class="bullet">Conduct frequent team building activities</li>
      </ul>
    </div>

    <div class="bulleted-list">
      <h2 class="bullet-intro">
        FOTO are staffers who are apprehensive about returning to the office for various reasons, including uncertainty,
        planned schedules and health/safety concerns.
      </h2>
      <ul>
        <li class="bullet">
          Situations associated with ongoing childcare and elderly care which can make it difficult for them to be in
          the office – Managers need to <span>display empathy </span> by working with employees on flexible schedules and
          help employees regain their focus
        </li>
        <li class="bullet">
          <span>Be flexible to help them adjust to the new norm</span> - Disrupting the work-life balance: Most employees
          came up with a suitable schedule that allowed them to work productively and have some extra time for non-work-related
          activities.
        </li>
        <li class="bullet">Conduct frequent team building activities</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .recommendation-section-wrapper {
    flex-direction: row;
    gap: var(--size-12);
  }
</style>
