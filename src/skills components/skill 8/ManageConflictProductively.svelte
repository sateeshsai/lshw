<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="bulleted-list">
    <p class="intro">The 4 Shifts to Thrive in a Hybrid Workplace</p>
    <p class="bullet-intro">
      <span> 4 key mindset shifts</span> that everyone needs to adopt in order to thrive in a hybrid workplace.
    </p>
    <ul>
      <li class="bullet">
        <span>From Culture by Chance to Culture by Design</span> - isn't about imposing a path, but rather setting a framework
        and building through continuous input from people and iteration.
      </li>
      <li class="bullet">
        <span>From input to impact</span> – Create a team purpose focus on a most significant goal: the impact you want to
        create.
      </li>
      <li class="bullet">
        <span>From Synchronous to Asynchronous Collaboration</span> – Creates different and flexible rules, but still will
        be able to achieve common goals
      </li>
      <li class="bullet">
        <span>One-size fits all Vs. being Flexible</span> - Be intentional about creating an equal experience for every employee,
        including equal access to leaders, career opportunities, and learning and development.
      </li>
    </ul>
  </div>

  <div class="resources-title-container">
    <h2>Relevant trainings/ references</h2>
    <div class="resources-container">
      <div class="resource">
        <a href="https://thegeekyleader.com/2021/11/28/5-types-of-distance-in-a-hybrid-workplace/" target="_blank"
          >5 Types Of Distance In A Hybrid Workplace</a
        >
      </div>
      <div class="resource">
        <a
          href="https://www.linkedin.com/learning/how-leaders-drive-results-and-resolve-conflict-in-a-hybrid-workplace/drive-results-and-manage-conflict-as-a-hybrid-leader?autoplay=false&u=1504"
          target="_blank">How Hybrid Leaders Drive Results & Resolve Conflicts</a
        >
      </div>
    </div>
  </div>
</div>
