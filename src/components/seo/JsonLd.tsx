type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Server-rendered JSON-LD for SEO (no client JS). Pass schema.org objects from `@/lib/seo`. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
