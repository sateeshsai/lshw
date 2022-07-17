<script>
  import Nav from "./Nav.svelte";
  import Home from "./Home.svelte";
  import About from "./about components/About.svelte";
  import Skills from "./skills components/Skills.svelte";
  import { activeSection } from "./stateStore";

  // Service worker for Progressive Web App
  if ("serviceWorker" in navigator) {
    // console.log("SERVICE WORKER EXISTS");
    navigator.serviceWorker
      .register("serwor.js", {
        scope: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/", // THIS IS REQUIRED FOR RUNNING A PROGRESSIVE WEB APP FROM A NON_ROOT PATH
      })
      .then(
        function (registration) {
          // console.log("Registration was successful");
          // console.log("ServiceWorker registration successful with scope: ", registration.scope);
        },
        function (err) {
          // registration failed
          console.log("ServiceWorker registration failed: ", err);
        }
      );
  }

  let manifestData = {
    name: "Deloitte Private Pursuit Center",
    short_name: "DPPC",
    description: "Sample Deloitte Private Pursuit Center description",
    start_url: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/index.html",
    display: "fullscreen",
    icons: [
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "https://americas.internal.deloitteonline.com/sites/pursuitscoe/dynamic/SitePages/images/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
</script>

<!-- FONTS -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
<link
  href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
  rel="stylesheet"
/>

<!-- ELEMENTS -->
{#if $activeSection !== "home"}
  <Nav />
{/if}
<main>
  {#if $activeSection === "home"}
    <Home />
  {/if}
  {#if $activeSection === "about"}
    <About />
  {/if}
  {#if $activeSection === "skills"}
    <Skills />
  {/if}
</main>

<!-- <div class="colorPalette">
  <div style="background-color: var(--c1)" class="color">c1</div>
  <div style="background-color: var(--c2)" class="color">c1</div>
  <div style="background-color: var(--c3)" class="color">c1</div>
  <div style="background-color: var(--c4)" class="color">c1</div>
  <div style="background-color: var(--c5)" class="color">c1</div>
  <div style="background-color: var(--c6)" class="color">c1</div>
  <div style="background-color: var(--c7)" class="color">c1</div>
  <div style="background-color: var(--c8)" class="color">c1</div>
</div> -->
<style>
  /* GLOBAL STYLESHEET */
  /* RESETS */
  :global(html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video) {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }

  /* HTML5 display-role reset for older browsers */
  :global(article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section) {
    display: block;
  }

  :global(body) {
    line-height: 1;
  }

  :global(ol, ul) {
    /* list-style: none; */
  }

  :global(blockquote, q) {
    quotes: none;
  }

  :global(blockquote:before, blockquote:after, q:before, q:after) {
    content: "";
    content: none;
  }

  :global(table) {
    border-collapse: collapse;
    border-spacing: 0;
  }

  :global(input[type="text"], textarea) {
    flex: 1;
    border: none;
  }

  :global(input[type="text"]:focus, textarea:focus) {
    border: none;
    outline: 0.1rem solid var(--accent-color);
  }

  :global(textarea) {
    font-family: inherit;

    border: none;
    overflow: auto;
    outline: none;

    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    resize: none;
  }

  :global(input::placeholder, textarea::placeholder) {
    color: var(--text-dull-color);
    font-size: var(--fs3);
  }

  :global(input) {
    padding: var(--size-3);
    border-radius: var(--size-2);
    background-color: var(--subtile-color1);
    color: var(--text-primary-color);
    font-size: var(--fs4);
    flex: 1;
  }

  :global(a) {
    text-decoration: none;
    color: var(--text-primary-color);
    font-weight: 600;
  }

  :global(button) {
    border: none;
    display: block;
    cursor: pointer;
  }

  /* HIDE SCROLLBAR */
  :global(*) {
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
    font-family: "open sans";
  }

  :global(*::-webkit-scrollbar) {
    display: none; /* Safari and Chrome */
  }

  :global(* span) {
    font-weight: 600;
  }

  :global(html) {
    /* THEME */
    /* FONT SIZES */

    --fs0: 0.5rem;
    --fs1: 0.75rem;
    --fs1: 0.9rem;
    --fs2: 1rem;
    --fs3: 1.1rem;
    --fs4: 1.25rem;
    --fs45: 1.4rem;
    --fs5: 1.5rem;
    --fs6: 2rem;
    --fs7: 2.5rem;
    --fs8: 3rem;
    --fs9: 3.5rem;

    /* SIZES */
    --size-000: -0.5rem;
    --size-00: -0.25rem;
    --size-1: 0.25rem;
    --size-2: 0.5rem;
    --size-3: 0.8rem;
    --size-4: 1.2rem;
    --size-5: 1.25rem;
    --size-6: 1.5rem;
    --size-7: 1.75rem;
    --size-8: 2rem;
    --size-9: 2.5rem;
    --size-95: 3rem;
    --size-10: 3.5rem;
    --size-11: 4rem;
    --size-12: 5rem;
    --size-13: 7.5rem;
    --size-14: 10rem;
    --size-15: 15rem;
    --size-16: 20rem;
    --size-17: 30rem;

    /* COLORS */
    --bright-green: #00c707;
    --lime-green: #b1fe52;
    --accent-color: hsl(215, 95%, 58%);
    --accent-dull-color: hsl(215, 62%, 35%);
    --accent-light-color: hsl(215, 95%, 70%);
    --hue: 215;
    --nav-color: hsl(var(--hue), 0%, 0%);
    --background-color: hsl(var(--hue), 5%, 95%);
    --color1: hsl(var(--hue), 12%, 11%);
    --color2: hsl(var(--hue), 12%, 16%);
    --color2a: hsl(var(--hue), 12%, 20%);
    --color3: hsl(var(--hue), 12%, 22%);
    --color3a: hsl(var(--hue), 12%, 26%);
    --color4: hsl(var(--hue), 8%, 40%);
    --color5: hsl(var(--hue), 8%, 45%);
    --color6: hsl(var(--hue), 8%, 60%);
    --color7: hsl(var(--hue), 5%, 80%);
    --color8: hsl(var(--hue), 5%, 87%);
    --opacity: 1;
    --tile-color-opacity: hsla(var(--hue), 12%, 11%, var(--opacity));
    --tile-color1: hsl(var(--hue), 12%, 14%);
    --subtile-color1: hsl(var(--hue), 13%, 15%);
    --subtile-color2: hsl(var(--hue), 12%, 20%);
    --subtile-color3: hsl(var(--hue), 11%, 30%);
    --text-dull-color: hsl(var(--hue), 8%, 50%);
    --icon-stroke-color: hsl(var(--hue), 10%, 56%);
    --c8: hsl(var(--hue), 12%, 60%);
    --text-dull-color: hsl(var(--hue), 10%, 45%);
    --text-secondary-color: hsl(var(--hue), 15%, 70%);
    --text-color: hsl(var(--hue), 10%, 20%);
    --text-reverse-color: hsl(var(--hue), 10%, 90%);
    --text-bright-color: hsl(var(--hue), 0%, 100%);

    /* UTILITY COLORS */
    --red: hsl(0, 67%, 62%);
    --debug: var(--red) 2px solid;

    /* STROKE WIDTHS */
    --stroke-width-0: 0.05rem;
    --stroke-width-1: 0.1rem;
    --stroke-width-2: 0.15rem;

    /* SHADOWS */
    --shadow-color: var(var(--nav-color));
    --shadow-strength: 10%;

    /* INNER */
    --inner-shadow-1: inset 0 0 0 1px hsl(var(--shadow-color) / calc(var(--shadow-strength) + 9%));

    /* MISC */
    --error-outline: 0.1rem var(--red) solid;

    /* PROPERTIES */
    font-size: clamp(8px, calc(0.4vw + 0.4vh + 0.1vmin), 22px);
    line-height: 1.5em;
    font-family: "open sans";
    font-weight: 300;
    color: var(--text-color);
    background-color: var(--background-color);
  }

  :global(body) {
    font-size: var(--fs2);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    display: flex;
    flex-direction: column;
    background-color: var(--background-color);
    flex: 1;
    position: relative;
  }

  /* .colorPalette {
    display: flex;
  }

  .color {
    padding: 1rem;
  } */

  @media (min-width: 1280px) and (min-height: 720px) and (orientation: landscape) {
    main {
      max-height: 100vh;
    }
  }
</style>
