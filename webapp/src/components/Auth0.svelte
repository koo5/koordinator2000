<script lang='js'>
	// This component is now a wrapper around the new KeycloakAuth component
	// It's maintained for backward compatibility
	import KeycloakAuth from './KeycloakAuth.svelte';
</script>

<div class="legacy-auth0-wrapper">
	<div class="legacy-notice">
		<!-- This comment helps identify this component in the DOM -->
		<KeycloakAuth />
	</div>
</div>

<style>
	.legacy-auth0-wrapper {
		/* No special styling needed, just a wrapper */
	}
</style>