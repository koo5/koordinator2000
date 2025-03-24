<script lang="js">
	import { onMount, onDestroy } from 'svelte';
	import { my_user } from '../my_user.js';
	import { browser } from '$app/environment';
	import '../polyfills.js';  // Import polyfills

	// Declare firebase variable but don't import directly
	let firebase;
	
	// Only load in browser context
	if (browser) {
		// We'll initialize firebase in onMount
	}

	export let uid = "default";
	let firepad_container;
	let firepad;
	let codeMirror;

	function ensureDependencies() {
		if (!browser) return Promise.resolve();
		
		return new Promise((resolve, reject) => {
			// Check if dependencies are already loaded via app.html
			if (typeof Firepad !== 'undefined' && typeof CodeMirror !== 'undefined') {
				resolve();
				return;
			}
			
			// If not loaded, we could load them dynamically here
			// But they should already be loaded via app.html
			console.warn('Firepad or CodeMirror not found. Check app.html script tags.');
			resolve();
		});
	}

	function init_firebase() {
		if (!browser) return;
		
		//console.log('init_firebase');
		var firebase_config = {
			apiKey: "<API_KEY>",
			authDomain: "firepad-gh-tests.firebaseapp.com",
			databaseURL: "https://firepad-gh-tests.firebaseio.com"
		};

		// Only initialize if Firebase is available
		if (typeof firebase !== 'undefined' && !firebase.apps.length) {
			firebase.initializeApp(firebase_config);
		}
	}

	function getFirebaseRef() {
		if (!browser || typeof firebase === 'undefined') return null;
		
		var ref = firebase.database().ref();
		ref = ref.child(uid);
		if (typeof console !== 'undefined') {
			console.log('Firebase data: ', ref.toString());
		}
		return ref;
	}

	function init_firepad() {
		if (!browser) return;
		
		// Make sure we have the container element
		if (!firepad_container) {
			console.error('Firepad container not found');
			return;
		}

		// Get Firebase reference
		var firepadRef = getFirebaseRef();
		if (!firepadRef) return;
		
		// Initialize CodeMirror
		codeMirror = CodeMirror(firepad_container, { 
			lineWrapping: true, 
			lineNumbers: true 
		});

		// Initialize Firepad
		firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
			richTextToolbar: true,
			richTextShortcuts: true
		});

		// Set default contents when ready
		firepad.on("ready", function () {
			console.log("Firepad ready");
			if (firepad.isHistoryEmpty()) {
				firepad.setHtml(
					"<span style=\"font-size: 24px;\">Rich-text editing with <span style=\"color: red\">Firepad!</span></span><br/>\n" +
					"<br/>" +
					"<div style=\"font-size: 18px\">" +
					"Supports:<br/>" +
					"<ul>" +
					"<li>Different " +
					"<span style=\"font-family: impact\">fonts,</span>" +
					"<span style=\"font-size: 24px;\"> sizes, </span>" +
					"<span style=\"color: blue\">and colors.</span>" +
					"</li>" +
					"<li>" +
					"<b>Bold, </b>" +
					"<i>italic, </i>" +
					"<u>and underline.</u>" +
					"</li>" +
					"<li>Lists" +
					"<ol>" +
					"<li>One</li>" +
					"<li>Two</li>" +
					"</ol>" +
					"</li>" +
					"<li>Undo / redo</li>" +
					"<li>Cursor / selection synchronization.</li>" +
					"<li><checkbox></checkbox> It supports customized entities.</li>" +
					"<li>And it's all fully collaborative!</li>" +
					"</ul>" +
					"</div>"
				);
			}
		});

		// Register custom checkbox entity
		firepad.registerEntity("checkbox", {
			render: function (info, entityHandler) {
				var inputElement = document.createElement("input");
				inputElement.setAttribute("type", "checkbox");
				if (info.checked) {
					inputElement.checked = "checked";
				}
				inputElement.addEventListener("click", function () {
					entityHandler.replace({ checked: this.checked });
				});
				return inputElement;
			}.bind(this),
			fromElement: function (element) {
				var info = {};
				if (element.hasAttribute("checked")) {
					info.checked = true;
				}
				return info;
			},
			update: function (info, element) {
				if (info.checked) {
					element.checked = "checked";
				} else {
					element.checked = null;
				}
			},
			export: function (info) {
				var inputElement = document.createElement("checkbox");
				if (info.checked) {
					inputElement.setAttribute("checked", true);
				}
				return inputElement;
			}
		});
	}

	onMount(async () => {
		if (browser) {
			try {
				// Dynamically import Firebase modules
				const firebaseModule = await import('@firebase/app');
				firebase = firebaseModule.default;
				await import('firebase/database');
				
				// Ensure Firepad and CodeMirror are loaded
				await ensureDependencies();
				
				// Initialize Firebase and Firepad
				init_firebase();
				init_firepad();
			} catch (error) {
				console.error("Error initializing Firepad:", error);
			}
		}
	});

	onDestroy(() => {
		// Clean up Firepad and CodeMirror instances
		if (firepad) {
			firepad.dispose();
		}
		// CodeMirror doesn't have a standard dispose method,
		// but we could implement additional cleanup if needed
	});
</script>

<style>
    #firepad-container {
      width: 100%;
      height: 500px;
    }
	:global(.powered-by-firepad) {
		display: none !important;
	}
</style>

<div id="firepad-container" bind:this={firepad_container}></div>