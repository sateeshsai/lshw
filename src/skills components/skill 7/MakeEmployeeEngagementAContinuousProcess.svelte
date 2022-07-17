<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="bulleted-list">
    <ul>
      <li class="bullet">
        Discuss Communication Preferences - determine the most effective form of communication for the team
      </li>
      <li class="bullet">
        New methodologies and tools that positively influence workflow and mitigate employee pain points through a
        frictionless workplace ecosystem.
      </li>
      <li class="bullet">
        Beyond conversing on specific topics or channels, employees want other ways to connect, give feedback, share
        stories etc. without having to jump between tools and applications.
      </li>
      <li class="bullet">
        Beyond conversing on specific topics or channels, employees want other ways to connect, give feedback, share
        stories etc. without having to jump between tools and applications.
      </li>
      <li class="bullet">
        Make Rewards and Feedback More Intuitive and Exciting: Gamification | Polling | Quiz | Surveys
      </li>
      <li class="bullet">Well-being activities and informal connects</li>
      <li class="bullet">Videos calls and brain storming session</li>
    </ul>
  </div>

  <div class="quote">
    <span>Make it personal:</span> Every single one of your team members are going to have a different experience working
    in hybrid. Every individual situation needs to be taken into account and consideration before making any decision
  </div>
</div>
