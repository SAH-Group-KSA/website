# Content mappers

CMS documents map into app contracts here.

When `FEATURE_CMS` is enabled:

1. Fetch from `src/lib/sanity.ts` (GROQ + CDN client)
2. Map with `home.ts` / `coach.ts` / `course.ts` into `SiteContent`, `Coach`, `Course`, `PageSeo`
3. Keep `getContent` / `getCoaches` / `getCourses` / `getPageSeo` as the only UI entry points

Phase 1: `FEATURE_CMS` stays `0`. Coach/course mappers are implemented; `mapHomeDocument` returns null until Phase 4.

Do **not** import Sanity SDK types into React components.

## Schema note

App contracts (`SiteContent`, `Coach`, `Course`) are the stable UI targets.  
Sanity document types and authoring UX are designed in Phase 1 of [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](../../../docs/BACKEND_IMPLEMENTATION_GUIDE.md):

- **Document-per-locale** — marketing / `homePage` / `pageSeo` / company pages  
- **Field-level bilingual `{en,ar}`** — coaches, courses, catalog entities  

See also architecture guide §10 “Editorial content requirements”.