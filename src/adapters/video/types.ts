/** Video provider seam — pick Mux or Vimeo before Phase 3 player work. */
export type VideoPlatform = "mux" | "vimeo";

export type VideoPlayback = {
  platform: VideoPlatform;
  id: string;
  /** Signed / private playback URL when available. */
  playbackUrl?: string;
};

export async function resolvePlayback(_input: {
  platform: VideoPlatform;
  id: string;
}): Promise<VideoPlayback | null> {
  return null;
}
