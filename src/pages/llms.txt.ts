import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://einfachfabi.com';
	const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	const techPosts = posts.filter((p) => p.data.category !== 'Travel');
	const travelPosts = posts.filter((p) => p.data.category === 'Travel');

	const lines: string[] = [
		'# EinfachFabi',
		'',
		'> Practical Linux, homelab, and technology guides alongside personal travel stories, roadtrips, and vacation impressions.',
		'',
		'## Main Sections',
		'',
		`- [Home](${baseUrl}/): Latest articles and topic overview`,
		`- [Tech Guides & Experience](${baseUrl}/tech/): Hands-on Linux, Windows, homelab, and server tutorials`,
		`- [Travel & Impressions](${baseUrl}/travel/): Personal travel stories, photography, and roadtrips`,
		`- [All Posts](${baseUrl}/posts/): Complete archive of published articles`,
		`- [Categories & Tags](${baseUrl}/categories/): Browse content by topic or tag`,
		`- [About](${baseUrl}/about/): Information about Fabi and this website`,
		'',
	];

	if (techPosts.length > 0) {
		lines.push('## Tech Guides & Tutorials', '');
		for (const post of techPosts) {
			lines.push(`- [${post.data.title}](${baseUrl}/${post.id}/): ${post.data.description}`);
		}
		lines.push('');
	}

	if (travelPosts.length > 0) {
		lines.push('## Travel & Impressions', '');
		for (const post of travelPosts) {
			lines.push(`- [${post.data.title}](${baseUrl}/${post.id}/): ${post.data.description}`);
		}
		lines.push('');
	}

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
