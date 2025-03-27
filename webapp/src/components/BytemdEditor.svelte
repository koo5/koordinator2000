<script lang="js">

  export let title;
  export let paragraph;

  import { onMount } from "svelte";

  let value = "";
  let mode = "split";

  function handleChange(e) {
    value = e.detail.value;
  }

  let Editor;

  onMount(async () => {
    /*const m = await import("bytemd");
    Editor = m.default;*/
    const res = await fetch(
      "https://raw.githubusercontent.com/bytedance/bytemd/gh-pages/example.md"
    );
    const text = await res.text();
    value = text;
  });

  let enabled = {
//    breaks: false,
//    gfm: true,
//highlight: true,
//math: true,
//mermaid: true,
//    frontmatter: true,
//    footnotes: true,
//    'import-html': true,
//    'import-image': true,
//    'medium-zoom': true,
  };

  /*function toBlobUrl(file) {
      //return URL.createObjectURL(file);
  }*/

  $: plugins = [
//    enabled.breaks && breaks(),
//    enabled.gfm && gfm(),
//enabled.highlight && highlight(),
//enabled.math && math(),
//enabled.mermaid && mermaid(),
//    enabled.footnotes && footnotes(),
    /*    enabled['import-image'] &&
    importImage({
    upload(files) {
    return Promise.all(files.map((file) => toBlobUrl(file)));
    },
    }),
    enabled.frontmatter && frontmatter(),
    enabled['import-html'] && importHtml(),*/
//enabled['medium-zoom'] && mediumZoom(),

// For test:
// {
//   editorEffect(cm, el) {
//     console.log('on', cm, el);
//     return () => {
//       console.log('off', cm, el);
//     };
//   },
//   viewerEffect(el, result) {
//     console.log('on', el, result);
//     return () => {
//       console.log('off', el, result);
//     };
//   },
// },
  ].filter((x) => x);

  function sanitize(schema) {
    schema.protocols.src.push("blob");
    return schema;
  }
</script>


<div class="container">
  <div class="line">
    Mode:
    {#each ['split', 'tab'] as m}
      <label> <input type="radio" bind:group={mode} value={m}/> {m} </label>
    {/each}
  </div>
  <div class="line">
    Plugins:
    {#each Object.keys(enabled) as p}
      {' '}
      <label> <input type="checkbox" bind:checked={enabled[p]}/> {p} </label>
    {/each}
  </div>
  <svelte:component this={Editor} {value} {mode} {plugins} {sanitize} on:change={handleChange}/>
</div>

export let {title}: string;
export let {paragraph}: string;
