<script lang="ts">
	import { isValidIdentifier, oAuthLogin } from '$lib/atprotoAuth';

	let loginIdentifierInput = $state<string>('');
	let loginStatusMessage = $state<string | undefined>();

	function performLogin(e: Event) {
		e.preventDefault();
		if (loginIdentifierInput && isValidIdentifier(loginIdentifierInput) !== null) {
			oAuthLogin(loginIdentifierInput, (msg: string) => (loginStatusMessage = msg));
		}
	}
</script>

<form class="login-form" onsubmit={performLogin}>
	<div class="header">
		<h2 class="title">Sign in with Bluesky</h2>
		<p class="subtitle">Enter your Bluesky handle to get started</p>
	</div>

	<div class="form-content">
		<div class="input-group">
			<label for="identifier">Handle</label>
			<input
				type="text"
				required
				autocomplete="off"
				placeholder="bsky.example.com"
				id="identifier"
				bind:value={loginIdentifierInput}
			/>
		</div>
		<button id="loginButton" type="submit" disabled={!isValidIdentifier(loginIdentifierInput)}
			>Continue</button
		>
		<small
			>Login information is only stored on your device and allows restricted access to view and
			delete Bluesky posts.</small
		>
		{#if loginStatusMessage}
			<div class="progress-message">
				<p>{loginStatusMessage}</p>
			</div>
		{/if}
	</div>
</form>

<style>
	.login-form {
		background: var(--surface-colour);
		border-radius: 8px;
		padding: 2rem;
		width: 100%;
		max-width: 450px;

		.header {
			text-align: center;
			margin-bottom: 2rem;
			.title {
				margin: 0;
				font-size: 1.6rem;
				margin-bottom: 0.5rem;
			}
			.subtitle {
				margin: 0;
			}
		}

		.form-content {
			display: flex;
			flex-direction: column;
			gap: 0.8rem;

			.input-group {
				display: flex;
				flex-direction: column;
				gap: 0.4rem;

				label {
					font-weight: 600;
					font-size: 0.9rem;
				}

				input {
					background-color: var(--overlay-colour);
					color: var(--text-colour);
					width: 100%;
					padding: 0.7rem;
					border-radius: 4px;
					border: none;
					font-size: 1rem;
					transition: all 0.2s;
					&:focus {
						outline: 1px solid var(--accent-colour);
					}
				}
			}

			#loginButton {
				width: 100%;
				background: var(--accent-colour);
				color: var(--crust-colour);
				border: none;
				padding: 0.8rem;
				border-radius: 4px;
				font-size: 1rem;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.2s;

				&:hover:not(:disabled) {
					background: hsl(from var(--accent-colour) h s 75%);
				}

				&:disabled {
					opacity: 0.5;
					cursor: not-allowed;
					transform: none;
				}
			}

			.progress-message {
				padding: 0.5rem;
				border-radius: 4px;
				border-left: 2px solid var(--accent-colour);
				p {
					margin: 0;
					color: var(--text-colour);
					font-size: 0.8rem;
				}
			}
		}
	}
</style>
