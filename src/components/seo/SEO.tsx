import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../store/useStore';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  type = 'website' 
}) => {
  const { settings } = useStore();

  const siteTitle = settings?.hero_title || 'Precission';
  const defaultDescription = 'Award-winning architectural portfolio and design studio specializing in modern, sustainable, and high-end residential projects.';
  const defaultImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1486325212027-8081e485255e';

  const metaTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Architectural Studio`;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const siteUrl = window.location.origin;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={window.location.href} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;