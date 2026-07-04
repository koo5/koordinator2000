<script lang="ts">
    import gql from 'graphql-tag';
    import MutationForm from '../../components/MutationForm.svelte';

    interface CampaignObject {
        description?: string;
        title?: string;
        uri?: string;

        [key: string]: any;
    }

    let files: FileList | null;
    $: file = files?.[0];

    async function load(file: File): Promise<CampaignObject[]> {
        let i = 0;
        const result: CampaignObject[] = [];
        const jsonData = JSON.parse(await file.text());

        if (Array.isArray(jsonData)) {
            jsonData.forEach((o: any) => {
                i++;
                if (!o.uri) {
                    o.uri = file.name + '#' + i;
                }
                result.push(load_o(o));
            });
        }

        return result;
    }

    function load_o(o: any): CampaignObject {
        const r: CampaignObject = {};
        r.description = o?.description;
        r.title = o?.title;
        r.uri = o?.uri;
        return r;
    }

    const UPSERT = gql`
        mutation MyMutation($objects: [campaigns_insert_input!]! = {}, $update_columns: [campaigns_update_column!]! = cause_id) {
            insert_campaigns(objects: $objects, on_conflict: { constraint: campaigns_uri_key, update_columns: $update_columns }) {
                affected_rows
            }
        }
    `;

    let objects: CampaignObject[] = [];
    $: if (file) {
        load(file).then(x => (objects = x));
    } else {
        objects = [];
    }

    $: vars = {
        objects,
        update_columns: ['description', 'smazano', 'stealth', 'suggested_highest_threshold', 'suggested_lowest_threshold', 'suggested_optimal_threshold', 'title'],
    };
</script>

<h1>bulk campaign import</h1>
<label class="label-text font-medium block mb-3">
    Campaigns JSON file:
    <input type="file" class="file-input file-input-bordered file-input-sm ml-2" bind:files />
</label>

<MutationForm mutation={UPSERT} variables={vars}>
    <button class="btn btn-primary btn-sm" type="submit">Submit</button>
    <br />
</MutationForm>
