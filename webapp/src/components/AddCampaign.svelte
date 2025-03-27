<script type='js'>
  import {onMount} from 'svelte';
  import MutationForm from './MutationForm.svelte';
  import gql from 'graphql-tag';
  import {my_user} from '../my_user.js';

  const ADD = gql`
  mutation MyMutation(
      $description: String = "",
      $maintainer_id: Int,
      $title: String = "",
      $suggested_lowest_threshold: bigint,
      $suggested_highest_threshold: bigint,
      $suggested_optimal_threshold: bigint,
      $collect_confirmations: Boolean = false
    )
    {
      insert_campaigns_one(object: {
        description: $description,
        maintainer_id: $maintainer_id,
        title: $title,
        suggested_lowest_threshold: $suggested_lowest_threshold,
        suggested_highest_threshold: $suggested_highest_threshold,
        suggested_optimal_threshold: $suggested_optimal_threshold,
        collect_confirmations: $collect_confirmations
      })
      {
        id
        }
    }
  `;

  let title = '';
  let description = '';
  let suggested_lowest_threshold = 8;
  let suggested_highest_threshold = 8000000000;
  let suggested_optimal_threshold = 800;
  let collect_confirmations = false;

  onMount(async () =>
  {
    clearForm()
  });

  function clearForm()
  {
    title = 'campaign' + Date.now();
    description = 'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ';
  }

</script>


<style>
  textarea { width: 100%; height: 20em; }
</style>


<MutationForm
  mutation={ADD}
  variables={{
    title,
    description,
    maintainer_id: my_user.id,
    suggested_lowest_threshold,
    suggested_highest_threshold,
    suggested_optimal_threshold,
    collect_confirmations
  }}
  on:done={(result)=>{
    clearForm();
  }}
>
  <h3>Add campaign:</h3>
  <label for="title">Title</label>
  <br>
  <input type="text" id="title" bind:value={title}/>
  <br>
  <label for="description">Description</label>
  <br>
  <textarea id="description" bind:value={description}/>
  <br>
  <label for="xxx">The lowest suggested threshold (the smallest number of people that should participate.
    Participating in a smaller number of people is expected to either bring no discernible effect, and/or to
    bring harm to the participants:</label>
  <br>
  <input type="number" id="xxx" bind:value={suggested_lowest_threshold}/>
  <br>
  <label for="xxxx">The highest suggested threshold (the highest threshold that anyone should set. The number of
    participants is not expected to grow beyond this. For example: a campaign targetted at a local issue in a
    village of 160 people should suggest 160 or less):</label>
  <br>
  <input type="number" id="xxxx" bind:value={suggested_highest_threshold}/>
  <br>
  <label for="xxxxx">Suggested threshold:</label>
  <br>
  <input type="number" id="xxxxx" bind:value={suggested_optimal_threshold}/>
  <br>
  <label for="collect_confirmations">Collect confirmations:</label>
  <br>
  <input type="checkbox" id="collect_confirmations" bind:checked={collect_confirmations}/>
  <br/>
  <button type="submit">Add Campaign</button>
</MutationForm>