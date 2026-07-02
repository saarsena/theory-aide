// Eleventy config for the Theory Aide site.
// Input is the site/ directory itself; TS sources and the esbuild output are
// excluded from templating. Bundles land in _site/assets via passthrough.
export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "site/dist": "assets" });
    eleventyConfig.ignores.add("site/src/**");
    eleventyConfig.ignores.add("site/dist/**");
    eleventyConfig.ignores.add("site/build.ts");
    eleventyConfig.ignores.add("site/tsconfig.json");

    return {
        templateFormats: ["njk", "md"],
        markdownTemplateEngine: "njk",
        dir: {
            input: "site",
            output: "site/_site",
            includes: "_includes",
            data: "_data",
        },
    };
}
