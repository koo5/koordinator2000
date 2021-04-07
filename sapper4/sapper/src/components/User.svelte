<script>
	//import {my_user, register, logout} from 'srcs/my_user.js';
	//import Auth0 from "cmps/Auth0.svelte";
	//import {login} from '@dopry/svelte-auth0';
	//import SubscribedItemsInner from 'cmps/SubscribedItemsInner.svelte';
	import {subscribe, gql} from "srcs/apollo.js";

	/*
	$: my_user_id = $my_user.id
	$: account_email_subscription = subscribe(
		gql`
			subscription ($my_user_id: Int) {
  				accounts(where: {id: {_eq: $my_user_id}}) {
					email
				}
			}`,
			{
				variables: {
					my_user_id
				}
			}
	);

	function save()
	{

	}
	*/

	$: account_subscription = subscribe(
		gql`
		subscription ($user_id: Int!) {
			accounts(where: {id: {_eq: $user_id}}){
				id,
				name,
				email
			}
		}
			`,
		{
			variables: {
				user_id
			}
		}
	);

	$: console.log(account_subscription);
	$: {
			if(account_subscription.loading){
				console.log("Loading account data...");
			}else if(account_subscription.data){
				console.log(account_subscription.data);
			}
		}
	export let user_id;


</script>

	<h5>account</h5>
	account ID: {user_id}
	<br>
	{#if $account_subscription.loading}
	Loading account data...
	{:else if $account_subscription.data}
	Name: {$account_subscription.data.accounts[0].name}
	<br>
	e-mail: {$account_subscription.data.accounts[0].email}
	{/if}
