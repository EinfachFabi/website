import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { experimental_AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function cleanFeedHtml(html: string, baseUrl: string): string {
	return html
		// Convert root-relative src and href to absolute URLs
		.replace(/\b(src|href)="\/(?!\/)/g, `$1="${baseUrl}/`)
		// Strip Shiki syntax-highlighting <span> wrappers inside code blocks
		.replace(/<\/?span\b[^>]*>/g, '')
		// Strip inline style, class, tabindex, data-*, id, loading, and decoding attributes
		.replace(/\s+(?:style|class|tabindex|id|loading|decoding|fetchpriority|data-[a-z0-9-]+)="[^"]*"/gi, '');
}

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://einfachfabi.com';
	const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	const container = await experimental_AstroContainer.create();
	const lastBuildDate = posts[0]?.data.pubDate ?? new Date();

	const itemsXmlParts: string[] = [];

	for (const post of posts) {
		const postUrl = `${baseUrl}/${post.id}/`;
		const { Content } = await render(post);
		const rawBodyHtml = await container.renderToString(Content);
		const bodyHtml = cleanFeedHtml(rawBodyHtml, baseUrl);

		const rawThumb = post.data.image;
		const thumbAlt =
			post.data.imageAlt ?? `${post.data.title} – ${post.data.category} article cover`;

		let thumbUrl = `${baseUrl}/images/thumbs/default.svg`;
		let thumbMime = 'image/svg+xml';

		if (rawThumb && typeof rawThumb !== 'string') {
			const optimizedThumb = await getImage({
				src: rawThumb,
				width: 1200,
				height: 675,
				format: 'jpg',
				quality: 82,
			});
			thumbUrl = `${baseUrl}${optimizedThumb.src}`;
			thumbMime = 'image/jpeg';
		} else if (typeof rawThumb === 'string') {
			thumbUrl = rawThumb.startsWith('http') ? rawThumb : `${baseUrl}${rawThumb}`;
		}

		const fullHtml = `<p><img src="${escapeXml(thumbUrl)}" alt="${escapeXml(thumbAlt)}" /></p>\n${bodyHtml}`;
		const safeCdata = fullHtml.replace(/]]>/g, ']]]]><![CDATA[>');

		const categoriesXml = [post.data.category, ...(post.data.tags ?? [])]
			.map((cat) => `\t\t\t<category>${escapeXml(cat)}</category>`)
			.join('\n');

		itemsXmlParts.push(
			[
				'\t\t<item>',
				`\t\t\t<title>${escapeXml(post.data.title)}</title>`,
				`\t\t\t<link>${postUrl}</link>`,
				`\t\t\t<guid isPermaLink="true">${postUrl}</guid>`,
				`\t\t\t<description>${escapeXml(post.data.description)}</description>`,
				`\t\t\t<pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
				categoriesXml,
				`\t\t\t<media:content url="${escapeXml(thumbUrl)}" medium="image" type="${thumbMime}" />`,
				`\t\t\t<content:encoded><![CDATA[${safeCdata}]]></content:encoded>`,
				'\t\t</item>',
			].join('\n')
		);
	}

	const rssXml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">',
		'\t<channel>',
		'\t\t<title>EinfachFabi | Tech Guides &amp; Travel Impressions</title>',
		'\t\t<description>Practical Linux, homelab, and technology guides alongside travel stories and vacation impressions.</description>',
		`\t\t<link>${baseUrl}/</link>`,
		`\t\t<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
		'\t\t<language>en-us</language>',
		`\t\t<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`,
		itemsXmlParts.join('\n'),
		'\t</channel>',
		'</rss>',
	].join('\n');

	return new Response(rssXml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
