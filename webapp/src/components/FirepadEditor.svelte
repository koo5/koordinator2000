<script lang="js">
	import { onMount, onDestroy } from 'svelte';
	import { my_user } from '../my_user.ts';
	import { browser } from '$app/environment';
	import '../polyfills.js';  // Import polyfills

	export let uid = "default";
	let firepad_container;
	let firepad;
	let codeMirror;
	let firebaseApp;
	let database;

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

	async function init_firebase() {
		if (!browser) return;
		
		try {
			//console.log('init_firebase');
			const firebase_config = {
				apiKey: "AIzaSyDr4m4mQ8kAkj2QuCTUbLJaKDEamlJeZZw",
				authDomain: "firepad-gh-tests.firebaseapp.com",
				databaseURL: "https://firepad-gh-tests.firebaseio.com"
			};

			// Import Firebase modules from the package
			const { initializeApp, getApps, getApp } = await import('firebase/app');
			const { getDatabase } = await import('firebase/database');

			// Initialize Firebase app
			if (getApps().length === 0) {
				firebaseApp = initializeApp(firebase_config);
			} else {
				firebaseApp = getApp();
			}
			
			// Get database reference
			database = getDatabase(firebaseApp);
		} catch (error) {
			console.error("Error initializing Firebase:", error);
		}
	}

	async function getFirebaseRef() {
		if (!browser || !database) return null;
		
		try {
			// Import the ref function dynamically
			const { ref } = await import('firebase/database');
			
			// Get reference to the data location
			const databaseRef = ref(database, uid);
			
			console.log('Firebase data location:', uid);
			return databaseRef;
		} catch (error) {
			console.error("Error getting Firebase reference:", error);
			return null;
		}
	}

	async function init_firepad() {
		if (!browser) return;
		
		// Make sure we have the container element
		if (!firepad_container) {
			console.error('Firepad container not found');
			return;
		}

		try {
			// Get Firebase reference
			const firepadRef = await getFirebaseRef();
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
					const inputElement = document.createElement("input");
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
					const info = {};
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
					const inputElement = document.createElement("checkbox");
					if (info.checked) {
						inputElement.setAttribute("checked", true);
					}
					return inputElement;
				}
			});
		} catch (error) {
			console.error("Error initializing Firepad:", error);
		}
	}

	onMount(async () => {
		if (browser) {
			try {
				// Ensure Firepad and CodeMirror are loaded
				await ensureDependencies();
				
				// Initialize Firebase and Firepad
				await init_firebase();
				await init_firepad();
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