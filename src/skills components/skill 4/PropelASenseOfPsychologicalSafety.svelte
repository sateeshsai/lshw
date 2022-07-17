<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />

  <div class="recommendation-section-wrapper">
    <div class="lists-container">
      <div class="bulleted-list">
        <h2>Does your team feel psychologically safe?</h2>
        <ul>
          <li class="bullet">If you make a mistake in this team, will it be held against you?</li>
          <li class="bullet">Are the members of your team able to bring up problems and tough issues?</li>
          <li class="bullet">Do people on this team reject others for being different?</li>
          <li class="bullet">Do you feel safe taking risk on this team?</li>
          <li class="bullet">Does your leader/team member deliberately undermine one's efforts?</li>
          <li class="bullet">Are the unique skills and talents valued?</li>
        </ul>
      </div>

      <div class="highlight-tiles">
        <h2>A 5-thumb rule to help create a psychologically safe workplace</h2>
        <div class="tiles-wrapper">
          <div class="tile-wrapper">
            <div class="large">Make</div>
            <div class="text">it an explicit priority</div>
          </div>
          <div class="tile-wrapper">
            <div class="large">Facilitate</div>
            <div class="text">everyone speaking up</div>
          </div>
          <div class="tile-wrapper">
            <div class="large">Establish</div>
            <div class="text">norms for how failure is handled</div>
          </div>
          <div class="tile-wrapper">
            <div class="large">Create</div>
            <div class="text">Space for new ideas</div>
          </div>
          <div class="tile-wrapper">
            <div class="large">Embrace</div>
            <div class="text">Productive conflict</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bulleted-list">
      <h2>How can we address this?</h2>
      <ul>
        <li class="bullet">
          <span>Show your team you’re engaged:</span> By actively engaging, you create an environment where people feel it’s
          only OK to speak up; in fact, it’s encouraged and accepted
        </li>
        <li class="bullet">
          <span>Let your team see you understand</span> their perspective and give opportunity for them to clarify in case
          of any misunderstanding
        </li>
        <li class="bullet">
          <span>Avoid blaming to build trust:</span> We statements turn the responsibility into a group effort, rather than
          singling out an individual for a mistake
        </li>
        <li class="bullet">
          <span>Nip negativity in the bud</span> by reiterating you work together as a team and negativity will not be tolerated
        </li>
        <li class="bullet">
          <span>Be self-aware—and demand the same from your team</span> by sharing how you work best, how you like to communicate,
          and how you like to be recognized
        </li>
        <li class="bullet">
          <span>Include your team in decision making</span> by seeking their input, thoughts, and feedback
        </li>
        <li class="bullet"><span>Be open to feedback</span> and show that you’re flexible in approach</li>
        <li class="bullet">
          <span>Champion your team</span> by supporting their personal and professional development
        </li>
      </ul>
    </div>

    <div class="resources-title-container">
      <h2>Relevant trainings/ references</h2>
      <div class="resources-container">
        <div class="resource">
          <a
            href="https://www.brightful.me/blog/the-simple-guide-to-building-team-culture-in-a-hybrid-model/"
            target="_blank">Hybrid Environment: Building Team Culture</a
          >
        </div>
        <div class="resource">
          <a
            href="https://www.linkedin.com/learning/building-trust-6/building-trust?autoplay=false&u=1504"
            target="_blank">Building Trust in Virtual Teams</a
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .lists-container {
    display: flex;
    gap: var(--size-12);
  }

  .highlight-tiles {
    background-color: var(--color3);
    border-radius: var(--size-4);
    color: var(--text-reverse-color);
    padding: var(--size-8);
    display: flex;
    flex-direction: column;
    gap: var(--size-8);
  }

  .tiles-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--size-4);

    /* flex-direction: column; */
  }

  .tile-wrapper {
    display: flex;
    flex-direction: column;
    background-color: var(--color8);
    color: var(--text-color);
    padding: var(--size-4);
    border-radius: var(--size-3);
  }

  .large {
    font-size: var(--fs6);
    font-weight: 700;
  }

  .text {
    font-weight: 400;
  }
</style>
