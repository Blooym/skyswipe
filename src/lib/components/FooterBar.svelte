<script lang="ts">
	interface Props {
		handle: string;
		signoutAction: () => void;
	}

	const { handle, signoutAction }: Props = $props();
</script>

<footer>
	<p>
		Signed in as @{handle} (<button onclick={signoutAction} class="signout-action">sign out</button
		>)
	</p>
	<small>
		Created by <a href="https://bsky.app/profile/did:plc:p5yjdr64h7mk5l3kh6oszryk">Blooym</a> / View
		source on <a href="https://codeberg.org/Blooym/skyswipe">Codeberg</a>
	</small>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;

		p {
			margin: 0.3rem;
		}

		.signout-action {
			font-size: inherit;
			border: none;
			padding: 0;
			background-color: unset;
			color: var(--negative-colour);
			&:hover {
				color: hsl(from var(--negative-colour) h s 70%);
				text-decoration: underline;
				cursor: pointer;
			}
		}
	}
</style>
