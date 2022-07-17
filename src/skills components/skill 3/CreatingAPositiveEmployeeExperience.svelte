<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />

  <div class="recommendation-section-wrapper">
    <p class="intro">
      Amplifying their inclusive behavior, leaders should ensure that team members working virtually understand, feel,
      contribute the same value, have the same opportunities, as others who are in-person.
    </p>

    <div class="box-image">
      <div class="creating-positive-container">
        <div class="bulleted-list">
          <h2 class="creating-positive-title">Team lead role</h2>
          <ul class="creating-positive-content">
            <li class="bullet">Build trust</li>
            <li class="bullet">Value opinion</li>
            <li class="bullet">Seek feedback</li>
            <li class="bullet">Being inclusive</li>
          </ul>
        </div>

        <div class="bulleted-list">
          <h2 class="creating-positive-title">Manage teams</h2>
          <ul class="creating-positive-content">
            <li class="bullet">Collaboration</li>
            <li class="bullet">Innovation</li>
            <li class="bullet">Conflict management</li>
            <li class="bullet">Being inclusive</li>
          </ul>
        </div>

        <div class="bulleted-list">
          <h2 class="creating-positive-title">Team bonding</h2>
          <ul class="creating-positive-content">
            <li class="bullet">Social skills</li>
            <li class="bullet">Empathy</li>
            <li class="bullet">Listening</li>
            <li class="bullet">Well-being</li>
            <li class="bullet">Available and approachable</li>
          </ul>
        </div>

        <div class="bulleted-list">
          <h2 class="creating-positive-title">Managerial skills</h2>
          <ul class="creating-positive-content">
            <li class="bullet">Motivate</li>
            <li class="bullet">Open-mindedness</li>
            <li class="bullet">Provide alternatives or solutions</li>
            <li class="bullet">Provide direction</li>
          </ul>
        </div>
      </div>

      <div class="image-wrapper">
        <h2>Hybrid collaboration modes – applying them correctly</h2>
        <img src="./images/behavior/Creating a positive employee experience.png" alt="" />
      </div>
    </div>

    <div class="highlight-box">
      <h3>Increase leadership accessibility</h3>
      <ul>
        <li class="bullet">
          <span>Open house sessions with leadership:</span> Design sessions for casual connects with team members to engage
          in more relaxed conversations, to share experiences, challenges and solutions. (Ask me Anything)
        </li>

        <li class="bullet">
          <span>Skip level connects:</span> A level above informal connect to share their views, opinions and how things
          are working for them
        </li>
        <li class="bullet">
          <span> New hire/Lateral hires connect with leadership:</span> Suggestions on process, tools and approaches and
          best practices from their previous organization
        </li>
      </ul>
    </div>
  </div>
</div>

<style>
  img {
    width: 80%;
  }

  .creating-positive-container {
    display: flex;
    gap: var(--size-10);
    flex: 1;
    background-color: var(--color3);
    padding: var(--size-8);
    border-radius: var(--size-4);
    color: var(--text-reverse-color);
  }

  .creating-positive-wrapper {
    flex: 1;
  }

  .image-highlight-wrapper {
    /* display: flex; */
    gap: var(--size-10);
  }

  .image-wrapper {
    flex: 1;
  }

  .box-image {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: var(--size-10);
  }
</style>
