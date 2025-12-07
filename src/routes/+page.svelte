<script lang="ts">
	import { initOAuthClient, initOrRestoreOAuthSession, oAuthSignout } from '$lib/atprotoAuth';
	import { getBlueskyPosts } from '$lib/bluesky';
	import ApplicationError from '$lib/components/ApplicationError.svelte';
	import BlueskyPost from '$lib/components/BlueskyPost.svelte';
	import FooterBar from '$lib/components/FooterBar.svelte';
	import HeaderBar from '$lib/components/HeaderBar.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { randomItem } from '$lib/util';
	import type {} from '@atcute/atproto';
	import { AppBskyActorGetProfile, AppBskyFeedDefs } from '@atcute/bluesky';
	import { Client, ok } from '@atcute/client';
	import { OAuthUserAgent } from '@atcute/oauth-browser-client';
	import { onMount } from 'svelte';

	let oauthAgent = $state<OAuthUserAgent | undefined>();
	let xrpcClient = $state<Client | undefined>();

	let appLoading = $state<boolean>(true);
	let appLoadError = $state<string | undefined>();

	let actorProfile = $state<AppBskyActorGetProfile.$output | undefined>();
	let actorFeed = $state<AppBskyFeedDefs.FeedViewPost[]>([]);

	let feedCurrentCursor = $state<string | undefined>();
	let feedHasMorePosts = $state<boolean>(true);
	let feedCurrentPost = $state<AppBskyFeedDefs.FeedViewPost | undefined>();
	let processingPostUpdate = $state<boolean>(false);
	let feedIsLoadingPosts = $state<boolean>(false);

	onMount(async () => {
		try {
			initOAuthClient();
			const session = await initOrRestoreOAuthSession().catch((err) => {
				console.error('failed to restore oauth session, falling back to logged out.');
			});
			if (session) {
				oauthAgent = new OAuthUserAgent(session);
				xrpcClient = new Client({ handler: oauthAgent });

				actorProfile = ok(
					await xrpcClient.get('app.bsky.actor.getProfile', {
						params: {
							actor: oauthAgent.sub
						}
					})
				);
				await loadPostBatch(oauthAgent, xrpcClient);
				feedCurrentPost = randomItem(actorFeed);
			}
		} catch (err) {
			appLoadError = `${err}`;
			throw err;
		} finally {
			appLoading = false;
		}
	});

	async function loadPostBatch(oauthAgent: OAuthUserAgent, xrpcClient: Client) {
		const DESIRED_POST_COUNT = 300;

		if (!feedHasMorePosts || feedIsLoadingPosts) return;

		try {
			feedIsLoadingPosts = true;
			let cursor = feedCurrentCursor;
			const batchPosts: AppBskyFeedDefs.FeedViewPost[] = [];

			while (batchPosts.length < DESIRED_POST_COUNT && feedHasMorePosts) {
				const result = await getBlueskyPosts(xrpcClient, oauthAgent.sub, cursor);

				batchPosts.push(...result.feed);
				cursor = result.cursor;

				if (result.noMorePosts || !result.cursor) {
					feedHasMorePosts = false;
					break;
				}
			}

			actorFeed = batchPosts;
			feedCurrentCursor = cursor;
		} finally {
			feedIsLoadingPosts = false;
		}
	}

	async function updateFeedAfterAction(oauthAgent: OAuthUserAgent, xrpcClient: Client, post: any) {
		const updatedPosts = actorFeed.filter((p: any) => p.post.uri !== post.post.uri);

		if (updatedPosts.length === 0) {
			if (feedHasMorePosts) {
				feedCurrentPost = undefined;
				await loadPostBatch(oauthAgent, xrpcClient);
				feedCurrentPost = actorFeed.length > 0 ? randomItem(actorFeed) : undefined;
			} else {
				actorFeed = [];
				feedCurrentPost = undefined;
			}
		} else {
			actorFeed = updatedPosts;
			feedCurrentPost = randomItem(updatedPosts);
		}
	}

	async function keepPostAction(oauthAgent: OAuthUserAgent, xrpcClient: Client, post: any) {
		try {
			processingPostUpdate = true;
			await updateFeedAfterAction(oauthAgent, xrpcClient, post);
		} finally {
			processingPostUpdate = false;
		}
	}

	async function deleteAction(oauthAgent: OAuthUserAgent, xrpcClient: Client, post: any) {
		if (!confirm('Are you sure you want to delete this post?')) {
			return;
		}

		try {
			processingPostUpdate = true;
			await xrpcClient.post('com.atproto.repo.deleteRecord', {
				input: {
					collection: 'app.bsky.feed.post',
					repo: oauthAgent.sub,
					rkey: post.post.uri.split('/').pop()
				}
			});
			await updateFeedAfterAction(oauthAgent, xrpcClient, post);
		} catch (err) {
			console.error(err);
		} finally {
			processingPostUpdate = false;
		}
	}
</script>

{#if appLoadError}
	<main class="page-content">
		<ApplicationError errorMessage={appLoadError} />
	</main>
{:else if appLoading}
	<main class="page-content">
		<LoadingSpinner />
	</main>
{:else if actorProfile && oauthAgent && xrpcClient}
	<HeaderBar />
	<main class="page-content">
		{#if feedIsLoadingPosts && actorFeed.length === 0}
			<LoadingSpinner />
			<p>Loading posts...</p>
		{:else if feedCurrentPost}
			<div class="posts-container">
				<button
					id="deleteButton"
					disabled={processingPostUpdate || feedIsLoadingPosts}
					onclick={() => deleteAction(oauthAgent!, xrpcClient!, feedCurrentPost)}>Delete</button
				>
				<BlueskyPost post={feedCurrentPost} />
				<button
					id="keepButton"
					disabled={processingPostUpdate || feedIsLoadingPosts}
					onclick={() => keepPostAction(oauthAgent!, xrpcClient!, feedCurrentPost)}>Keep</button
				>
			</div>
			<p class="batch-info">
				{actorFeed.length}
				{actorFeed.length === 1 ? 'post' : 'posts'} remaining in current batch.
			</p>
		{:else if feedIsLoadingPosts}
			<LoadingSpinner />
			<p>Loading more posts...</p>
		{:else if !feedHasMorePosts && actorFeed.length === 0}
			<p>
				You have no more posts to review - either you've seen them all in this session, or you have
				no posts.
			</p>
		{:else}
			<p>
				Something went wrong while loading your posts - check the browser console for more
				information.
			</p>
		{/if}
	</main>
	<FooterBar signoutAction={() => oAuthSignout(oauthAgent!)} handle={actorProfile.handle} />
{:else}
	<main class="page-content">
		<div class="intro">
			<h1>Skyswipe</h1>
			<p>Judge your Bluesky posts in a dating-app format.</p>
		</div>
		<LoginForm />
	</main>
{/if}

<style>
	.page-content {
		display: flex;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		.intro {
			margin-bottom: 2rem;
			text-align: center;
		}

		.posts-container {
			display: flex;
			gap: 0.8rem;
			align-items: center;
			width: 100%;
			max-width: 750px;

			button {
				height: 3rem;
				width: 4rem;
				border-radius: 4px;
				border: unset;
			}
		}

		#keepButton {
			background-color: var(--positive-colour);
			color: var(--crust-colour);
			font-weight: bold;
			&:hover:not(:disabled) {
				background: hsl(from var(--positive-colour) h s 65%);
			}
		}

		#deleteButton {
			background-color: var(--negative-colour);
			color: var(--crust-colour);
			font-weight: bold;
			&:hover:not(:disabled) {
				background: hsl(from var(--negative-colour) h s 65%);
			}
		}

		.batch-info {
			font-size: small;
			opacity: 0.7;
			margin-top: 1rem;
		}
	}
</style>
