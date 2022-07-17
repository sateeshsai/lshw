<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="recommendation-section-wrapper">
    <p class="intro">
      Multi-location participation can lead to distractions and disengagement. Avoiding “in the room” side conversations
      and being cognizant of people who joined online are some essentials for driving such meetings.
    </p>

    <div class="bullet-highlight-container">
      <div class="bulleted-list">
        <p>
          Nominate a <span>Hybrid meeting coordinator</span>, especially for meetings with larger or more disparate
          groups
        </p>

        <ul>
          <li class="bullet">To drive meaningful and engaging conversations with no interruptions.</li>
          <li class="bullet">Gather feedback or comments from remote participants.</li>
          <li class="bullet">
            Making them feel more at ease when contributing to the discussion with their insightful ideas.
          </li>
        </ul>
      </div>

      <div class="highlight-box">
        <h2>Ideal hybrid meeting should have</h2>
        <ul>
          <li class="bullet">
            Pre-determined meeting <span>priorities</span>
          </li>
          <li class="bullet">
            <span>Agenda</span> shared with potential participants
          </li>
          <li class="bullet">
            <span> Participants</span> who can contribute or benefit from it
          </li>
          <li class="bullet">
            <span>Engagement:</span> Hear out everyone's opinion directly, or through Chat or whiteboarding exercise
          </li>
          <li class="bullet">
            <span>Inclusivity:</span> Make sure everyone feels heard by encouraging contributions both from in person and
            home location professionals.
          </li>
        </ul>
      </div>
    </div>

    <div class="resources-title-container">
      <h2>Relevant trainings/ references</h2>
      <div class="resources-container">
        <div class="resource">
          <a href="https://develop.deloitte.com/elevating-virtual-hybrid-meetings" target="_blank"
            >Elevating Virtual and Hybrid Meetings microsite</a
          >
        </div>
        <div class="resource">
          <a href="https://develop.deloitte.com/tevhm2#/subpage/elevating-meetings" target="_blank"
            >Elevating meetings trainings</a
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .bullet-highlight-container {
    display: flex;
    gap: var(--size-10);
  }
</style>
