import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	DohJsonHandleResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver
} from '@atcute/identity-resolver';
import type { ActorIdentifier, Did } from '@atcute/lexicons';
import { isDid, isHandle } from '@atcute/lexicons/syntax';
import {
	configureOAuth,
	createAuthorizationUrl,
	defaultIdentityResolver,
	deleteStoredSession,
	finalizeAuthorization,
	getSession,
	type OAuthUserAgent
} from '@atcute/oauth-browser-client';

export function isValidLoginIdentifier(identifier: string): boolean {
	if (identifier.startsWith('@')) {
		identifier = identifier.substring(1);
	}
	return isHandle(identifier) || isDid(identifier);
}

export function initOAuthClient() {
	configureOAuth({
		identityResolver: defaultIdentityResolver({
			handleResolver: new CompositeHandleResolver({
				strategy: 'race',
				methods: {
					dns: new DohJsonHandleResolver({ dohUrl: 'https://cloudflare-dns.com/dns-query?' }),
					http: new WellKnownHandleResolver()
				}
			}),
			didDocumentResolver: new CompositeDidDocumentResolver({
				methods: {
					plc: new PlcDidDocumentResolver(),
					web: new WebDidDocumentResolver()
				}
			})
		}),
		metadata: {
			client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
			redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI
		}
	});
}

export async function initOrRestoreOAuthSession() {
	const LAST_SIGNED_IN_LOCALKEY = 'lastSignedIn';
	const params = new URLSearchParams(location.hash.slice(1));
	if (params.has('state') && (params.has('code') || params.has('error'))) {
		history.replaceState(null, '', location.pathname + location.search);
		const auth = await finalizeAuthorization(params);
		const did = auth.session.info.sub;
		localStorage.setItem(LAST_SIGNED_IN_LOCALKEY, did);
		return auth.session;
	} else {
		const lastSignedIn = localStorage.getItem(LAST_SIGNED_IN_LOCALKEY);
		if (lastSignedIn) {
			try {
				return await getSession(lastSignedIn as Did, { allowStale: true });
			} catch (err) {
				deleteStoredSession(lastSignedIn as Did);
				localStorage.removeItem(LAST_SIGNED_IN_LOCALKEY);
				throw err;
			}
		}
	}
}

export async function oAuthLogin(
	identifier: string,
	statusCallback: (text: string) => void = () => {}
) {
	try {
		if (!identifier || !isValidLoginIdentifier(identifier)) {
			throw new Error('invalid login identifier');
		}
		if (identifier.startsWith('@')) {
			identifier = identifier.substring(1);
		}
		statusCallback('Contacting PDS...');
		const authUrl = await createAuthorizationUrl({
			target: { type: 'account', identifier: identifier as ActorIdentifier },
			scope: import.meta.env.VITE_OAUTH_SCOPE
		});
		statusCallback('Redirecting...');
		await new Promise((resolve) => setTimeout(resolve, 250));
		window.location.assign(authUrl);
	} catch (err) {
		console.error(err);
		statusCallback(`An error occured: ${err}`);
	}
}

export async function oAuthSignout(
	oauthAgent: OAuthUserAgent,
	statusCallback: (text: string) => void = () => {}
) {
	if (!oauthAgent) {
		throw new Error('unable to signout as oauth agent or xrpc client are not initialised');
	}
	statusCallback('Signing out');
	await oauthAgent.signOut();
	location.reload();
}
