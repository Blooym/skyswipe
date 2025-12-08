import type {} from '@atcute/atproto';
import type { FeedViewPost } from '@atcute/bluesky/types/app/feed/defs';
import { ok, type Client } from '@atcute/client';
import type { ActorIdentifier } from '@atcute/lexicons';

export async function getBlueskyPosts(
	xrpcClient: Client,
	actor: ActorIdentifier,
	cursor?: string
): Promise<{ feed: FeedViewPost[]; cursor: string | undefined; noMorePosts: boolean }> {
	const posts = await ok(
		xrpcClient.get('app.bsky.feed.getAuthorFeed', {
			params: {
				actor: actor,
				includePins: false,
				limit: 100,
				filter: 'posts_no_replies',
				cursor
			}
		})
	);
	return {
		feed: posts.feed.filter(
			(i) =>
				!i.reply &&
				i.reason?.$type !== 'app.bsky.feed.defs#reasonRepost' &&
				i.post.embed?.$type !== 'app.bsky.embed.video#view' &&
				i.post.embed?.$type !== 'app.bsky.embed.external#view' &&
				i.post.embed?.$type !== 'app.bsky.embed.record#view' &&
				i.post.embed?.$type !== 'app.bsky.embed.recordWithMedia#view'
		),
		cursor: posts.cursor,
		noMorePosts: posts.cursor === cursor
	};
}
