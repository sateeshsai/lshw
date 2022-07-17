<script>
  import RecommendationTitle from "../RecommendationTitle.svelte";
  export let recommendation = undefined;
</script>

<div class="recommendation-section-container">
  <RecommendationTitle title={recommendation.shortName} on:back />
  <div class="recommendation-section-wrapper">
    <p class="intro">
      The Hybrid work model is still evolving, subject to talent models, roles, workstreams, industries, groups, and
      types of engagement. However, there are several resources and policies that can help our team members navigate
      through this mode.
    </p>

    <div class="build-awareness-container">
      <div class="build-awareness-wrapper">
        <div class="build-awareness-title">About the model</div>
        <div class="build-awareness-content">
          <a
            href="https://resources.deloitte.com/sites/US/WT/Safety/Documents/USI-Hybrid-Workplace-Model-FAQ.pdf?CT=1640196648345&OR=ItemsView"
          >
            Hybrid Workplace Model guidelines and FAQs
          </a>
        </div>
      </div>
      <div class="build-awareness-wrapper">
        <div class="build-awareness-title">Skills and trainings</div>
        <div class="build-awareness-content">
          <a href="https://develop.deloitte.com/tevhm2#/subpage/5vnb3">
            Explore on-demand learning resources or to enroll in a live-virtual workshop
          </a>
        </div>
      </div>
      <div class="build-awareness-wrapper">
        <div class="build-awareness-title">Wellness resources</div>
        <div class="build-awareness-content">
          <a
            href="https://deloittenet.deloitte.com/TalentOnDemand/Benefits/USI/AdditionalPrograms/Pages/LiveWellProgram.aspx"
          >
            Live Well program that provides 1:1 confidential support from experts on mental health, stress, and healthy
            lifestyle
          </a>
        </div>
      </div>
      <div class="build-awareness-wrapper">
        <div class="build-awareness-title">Other resources</div>
        <div class="build-awareness-content">
          <a
            href="https://amedeloitte.sharepoint.com/sites/DeloitteCollaborationCentral/Shared%20Documents/Forms/AllItems.aspx?id=/sites/DeloitteCollaborationCentral/Shared%20Documents/Hybrid%20Work%20Technology%20Resource%20Center/Hybrid%20Workplace%20Champion%20Network%20Overview_2022.pdf&parent=/sites/DeloitteCollaborationCentral/Shared%20Documents/Hybrid%20Work%20Technology%20Resource%20Center&p=true&wdLOR=c9538557E-A1EA-4F0C-BF86-1E69F8FAB702&ga=1"
          >
            Green Dot community focused on learning new ways of working in the hybrid workplace and sharing best
            practices with colleagues
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .build-awareness-container {
    display: flex;
    gap: var(--size-5);
  }

  .build-awareness-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    background-color: var(--color3);
    border-radius: var(--size-3);
    color: var(--text-reverse-color);
    padding: var(--size-5);
  }

  .build-awareness-title {
    color: var(--bright-green);
    font-weight: 700;
  }
</style>
