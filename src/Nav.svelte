<script>
  import { activeSection } from "./stateStore.js";
  import { slide } from "svelte/transition";
</script>

<nav in:slide>
  <div class="logo" on:click={() => ($activeSection = "home")}>
    Leadership Skills for <span> Hybrid Workplace</span>
  </div>
  <div class="nav-items-wrapper">
    <div class="nav-item" class:active={$activeSection === "home"} on:click={() => ($activeSection = "home")}>Home</div>
    <div class="nav-item" class:active={$activeSection === "about"} on:click={() => ($activeSection = "about")}>
      About
    </div>
    <div class="nav-item" class:active={$activeSection === "skills"} on:click={() => ($activeSection = "skills")}>
      Skills you need
    </div>
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-6) var(--size-9);
    /* background-image: linear-gradient(to right, #019006, #00c707, #00b407, #00a206, #019006); */
    background-color: var(--color1);
    color: var(--text-reverse-color);
  }
  .logo {
    font-weight: 600;
    font-size: var(--fs4);
    cursor: pointer;
  }

  .logo span {
    color: var(--bright-green);
  }

  .nav-items-wrapper {
    display: flex;
    gap: var(--size-4);
  }

  .nav-item {
    cursor: pointer;
  }

  .active {
    font-weight: 700;
    border-bottom: 0.3rem solid var(--bright-green);
  }
</style>
