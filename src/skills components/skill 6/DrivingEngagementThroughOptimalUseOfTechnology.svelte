<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="recommendation-section-wrapper">
    <div class="main-wrapper">
      <div class="bulleted-list">
        <h2 class="bullet-intro">Technologies you need to consider during hybrid…</h2>
        <ul>
          <li class="bullet">Collaboration tools – Have separate tools for each situation</li>
          <li class="bullet">Track progress on common projects, independent of physical location</li>
          <li class="bullet">File-sharing tools</li>
          <li class="bullet">Communication and Instant messaging</li>
          <li class="bullet">Online whiteboards</li>
          <li class="bullet">Well-being activities and informal connects</li>
          <li class="bullet">Videos calls and brain storming session</li>
        </ul>
      </div>

      <div class="quote-box">
        <div class="quote">
          <span>66%</span> of professionals fee that there is a priority to invest in their training and development
        </div>

        <div class="box">
          Meet <a
            href="https://amedeloitte.sharepoint.com/sites/DeloitteCollaborationCentral/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FDeloitteCollaborationCentral%2FShared%20Documents%2FHybrid%20Work%20Technology%20Resource%20Center%2FCollaboration%20Tool%20Guidance%2Epdf&parent=%2Fsites%2FDeloitteCollaborationCentral%2FShared%20Documents%2FHybrid%20Work%20Technology%20Resource%20Center"
          >
            Deloitte’s core collaboration tools</a
          > – Browse through this site to know more about Deloitte’s core collaboration tools
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .main-wrapper {
    display: flex;
    gap: var(--size-10);
  }

  .main-wrapper div {
    flex: 1;
  }

  .quote-box {
    display: flex;
    flex-direction: column;
  }
</style>
