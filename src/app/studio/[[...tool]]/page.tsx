import { NextStudioLayout } from "next-sanity/studio";
import StudioClient from "./StudioClient";

export { metadata, viewport } from "next-sanity/studio";

export const dynamic = "force-static";

export default function StudioPage() {
  return (
    <NextStudioLayout>
      <StudioClient />
    </NextStudioLayout>
  );
}
