export const load = async () => {
	const modules = import.meta.glob('./**/+page.md');

	const pages = await Promise.all(
		Object.entries(modules).map(async ([path, resolver]) => {
			const mod = await resolver();

			// "./math/algebra/+page.md" -> "math/algebra"
			const slug = path.replace('./', '').replace('/+page.md', '');

			// "math/algebra" -> ["math", "algebra"]
			const segments = slug.split('/');
			const category = segments[0]; // "math"
			const pageSlug = segments.slice(1).join('/'); // "algebra" (or "" if none)

			return {
				category,
				slug, // full slug "math/algebra"
				title: (mod.metadata?.title ?? pageSlug) || category,
				href: `/home/resources/${slug}`
			};
		})
	);

	// Group by category
	const groups = Object.values(
		pages.reduce((acc, page) => {
			if (!acc[page.category]) {
				acc[page.category] = {
					category: page.category,
					pages: []
				};
			}

			acc[page.category].pages.push({
				title: page.title,
				href: page.href,
				slug: page.slug
			});

			return acc;
		}, {})
	);

	return { groups };
};
