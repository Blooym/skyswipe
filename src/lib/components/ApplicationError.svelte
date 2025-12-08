<script lang="ts">
	interface Props {
		errorMessage: string;
	}
	const { errorMessage }: Props = $props();
</script>

<div class="application-error">
	<h1>Application Error</h1>
	<code>
		{errorMessage}
	</code>
	<p>
		View the browser console for more information. If this occurs after a page refresh, consider
		reporting it on <a href="https://github.com/Blooym/skyswipe">GitHub</a>.
	</p>
</div>

<style>
	.application-error {
		display: flex;
		flex-direction: column;
		text-align: center;

		h1 {
			margin: 0.5rem;
		}
		code {
			text-align: center;
			font-size: x-large;
			margin: 0.5rem;
		}
	}
</style>
