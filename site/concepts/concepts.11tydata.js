// Directory data for encyclopedia articles (site/concepts/*.md).
// The filename is the slug is the permanent URL: comments (future) and
// inbound links key on the URL, so never rename an article file.
export default {
    layout: "article.njk",
    tags: ["article"],
    eleventyComputed: {
        permalink: (data) => data.permalink ?? `/concepts/${data.page.fileSlug}/`,
    },
};
