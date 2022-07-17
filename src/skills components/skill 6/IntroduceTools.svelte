<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />

  <div class="quote">
    <span>78%</span> of professionals believe that they have the resources (e.g. people, tools, technology) to do their job
    well
  </div>

  <div class="highlight-box">
    <h2><span> A quick 5 </span>to successfully implementing new technology in the workplace:</h2>
    <ul>
      <li class="bullet">Investigate the need and identify the technologies/tools that will solve problem/Situation</li>
      <li class="bullet">Assemble an implementation team to champion the new technology/tool once you've chosen it.</li>
      <li class="bullet">Implement the technology through a pilot program to work out kinks and gain buy-in.</li>
      <li class="bullet">Train your employees to use the new tool.</li>
      <li class="bullet">Launch, fine-tuning the tool to fit your needs as you go.</li>
    </ul>
  </div>
</div>
