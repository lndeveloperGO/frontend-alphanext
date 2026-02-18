import { Helmet } from "react-helmet-async";
import { getAppName, getOgTitle, getOgDescription, getOgImage } from "@/lib/env";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterCard?: string;
    canonical?: string;
}

export const SEO = ({
    title = getAppName(),
    description = getOgDescription(),
    keywords = "AlphaNext, tryout, ujian, belajar, PTN, dinas",
    ogTitle = getOgTitle(),
    ogDescription = getOgDescription(),
    ogImage = getOgImage(),
    ogUrl = window.location.href,
    twitterCard = "summary_large_image",
    canonical,
}: SEOProps) => {
    const fullTitle = title === getAppName() ? title : `${title} | ${getAppName()}`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={ogDescription || description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph tags */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={ogUrl} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            <meta name="twitter:description" content={ogDescription || description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Canonical link */}
            {canonical && <link rel="canonical" href={canonical} />}
        </Helmet>
    );
};
