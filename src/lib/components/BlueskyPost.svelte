<script lang="ts">
	import type { AppBskyFeedDefs } from '@atcute/bluesky';

	interface Props {
		post: AppBskyFeedDefs.FeedViewPost;
	}

	const { post }: Props = $props();
</script>

<div class="post">
	<div class="author">
		<img id="avatar" alt="user avatar" src={post.post.author.avatar} />
		<div id="identity">
			<p id="displayName">{post.post.author.displayName}</p>
			<p id="handle">@{post.post.author.handle}</p>
		</div>
	</div>
	<div class="content">
		<p>{post.post.record.text}</p>
		{#if post.post.record.embed && post.post.embed!.$type === 'app.bsky.embed.images#view'}
			<img
				class="content-image"
				src={post.post.embed!.images[0].thumb}
				alt={post.post.embed!.images[0].alt}
			/>
		{/if}
	</div>
	<div class="details">
		<small
			><time
				>Posted on {new Intl.DateTimeFormat(undefined, {
					dateStyle: 'long',
					timeStyle: 'short'
				}).format(new Date(post.post.indexedAt))}</time
			></small
		>
		<div class="metainfo">
			<small>
				{post.post.likeCount || 0} likes ⸱
				{post.post.repostCount || 0} reposts ⸱
				{post.post.replyCount || 0} replies ⸱
				{post.post.bookmarkCount || 0} bookmarks
			</small>
			<small>
				<a
					target="_blank"
					href={`https://bsky.app/profile/${post.post.author.did}/post/${post.post.uri.split('/').pop()}`}
				>
					View on Bluesky
				</a>
			</small>
		</div>
	</div>
</div>

<style>
	.post {
		display: flex;
		flex-direction: column;
		background-color: var(--surface-colour);
		gap: 1rem;
		padding: 1rem;
		border-radius: 4px;
		flex: 1;

		.author {
			display: flex;
			gap: 0.6rem;
			align-items: center;

			#avatar {
				width: 48px;
				height: 48px;
				border-radius: 50%;
			}

			#identity {
				p {
					margin: 0.2rem 0;
				}

				#displayName {
					font-size: large;
					font-weight: bold;
				}

				#handle {
					font-size: 0.85rem;
				}
			}
		}

		.content {
			p {
				margin: 0.2rem 0;
				word-wrap: break-word;
			}
			.content-image {
				max-height: 500px;
				max-width: 100%;
				display: block;
				margin: 1.2rem auto;
				border-radius: 4px;
			}
		}

		.details {
			color: var(--subtext-colour);
			border-top: 1px dashed var(--subtext-colour);
			padding-top: 0.2rem;

			.metainfo {
				display: flex;
				justify-content: space-between;
			}
		}
	}
</style>
