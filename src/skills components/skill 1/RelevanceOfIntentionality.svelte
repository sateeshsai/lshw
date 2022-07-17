<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />

  <div class="recommendation-section-wrapper">
    <p>
      Hybrid work setup requires that Managers and Team Leads are intentional about ensuring that everyone’ perspective.
      The increased technological capabilities allow us to be intentional (and flexible), as we move towards the
      evolving systems and processes for working and communicating During the virtual mode of working several new
      platforms and technologies were implemented across teams and sub-teams. With more colocation opportunities, there
      is also a need to focus on how we continue using these platforms while bringing in the right mix of in-person
      engagements – as a team or in case of one-on-one.
    </p>

    <div class="image-bullet-container">
      <div class="image-wrapper">
        <h2>Hybrid collaboration modes – applying them correctly</h2>
        <img src="./images/behavior/Relevance of intentionality.png" alt="" />
      </div>
      <div class="highlight-box">
        <h2>Some recommendations</h2>
        <ul>
          <li class="bullet">
            Be considerate enough and professionals working from home need to be treated the same as those working from
            office
          </li>
          <li class="bullet bullet-level2">
            For smoother transition to Hybrid mode, ensure that current platforms (Teams, Zoom, others) continue to be
            used for work allocation, collaborations etc.
          </li>
          <li class="bullet">
            Keep the momentum of connects is key, whether in-person or virtual. If possible, seek in-person connects
            with coachee – this can help remove any barriers and assumptions
          </li>
          <li class="bullet">
            Coach connects should be with agenda underlining action points that should be revised in biweekly/monthly
            catch ups instead of having open ended conversations
          </li>
          <li class="bullet">
            Separate Coaching & TL responsibilities to segregate career progressions and wellbeing related aspects
            separate
          </li>
        </ul>
      </div>
    </div>

    <div class="resources-title-container">
      <h2>Relevant trainings/ references</h2>
      <div class="resources-container">
        <div class="resource">
          <a
            href="https://www.gartner.com/smarterwithgartner/4-modes-of-collaboration-are-key-to-success-in-hybrid-work"
            target="_blank">Intentional collaboration in a Hybrid World</a
          >
        </div>
        <div class="resource">
          <a
            href="https://www.linkedin.com/learning/making-hybrid-teams-work/establish-hybrid-team-norms?autoplay=false&SSO=1504"
            target="_blank">Establish Hybrid Team Norms</a
          >
        </div>
        <div class="resource">
          <a
            href="https://www.gartner.com/smarterwithgartner/4-modes-of-collaboration-are-key-to-success-in-hybrid-work"
            target="_blank">Connecting and Collaborating in a Virtual or Hybrid workplace</a
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.recommendation-section-container) {
    background-color: white;
    padding: var(--size-10);
    border-radius: var(--size-4);
    line-height: 1.4em;
    display: flex;
    flex-direction: column;
    gap: var(--size-8);
    flex: 1;
  }

  :global(.recommendation-section-wrapper) {
    display: flex;
    flex-direction: column;
    gap: var(--size-10);
  }

  :global(.recommendation-section-container h2) {
    font-size: var(--fs5);
    font-weight: 700;
  }

  :global(.recommendation-section-container h2 span) {
    font-weight: 700;
  }

  :global(.recommendation-section-container p span) {
    font-weight: 700;
  }

  :global(.recommendation-section-container ul) {
    list-style-type: disc;
    list-style-position: outside;
    transform: translateX(1.8rem);
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
  }

  :global(.intro) {
    font-size: var(--fs6);
    line-height: 1.5em;
  }

  :global(.bulleted-list) {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    flex: 1;
  }

  :global(.highlight-box) {
    background-color: var(--color8);
    padding: var(--size-8);
    border-radius: var(--size-4);
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }

  :global(.resources-title-container) {
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
    background-color: var(--color5);
    padding: var(--size-8);
    border-radius: var(--size-3);
    color: var(--text-reverse-color);
  }

  :global(.resources-container) {
    display: flex;
    gap: var(--size-8);
  }

  :global(.resource) {
    padding: var(--size-3);
    background-color: var(--color3);
    border-radius: var(--size-2);
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .image-bullet-container {
    display: flex;
    gap: var(--size-8);
    margin-left: 0;
  }

  :global(.image-wrapper) {
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }

  :global(.quote) {
    font-size: var(--fs7);
    line-height: 1.3em;
  }

  :global(.quote span) {
    color: var(--bright-green);
  }

  :global(.box) {
    font-size: var(--fs6);
    background-color: var(--color8);
    padding: var(--size-4);
    border-radius: var(--size-3);
    line-height: 1.3em;
  }
</style>
