import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowProject } from "../types/ShowProject";
import type { ProjectTransferPayload } from "../types/ProjectTransfer";
import { PROJECT_TRANSFER_FORMAT, PROJECT_TRANSFER_VERSION } from "../constants/transferFormat";
import { CUE_STATUS_ARCHIVED } from "../constants/CueStatus";

export interface ProjectTransferSource {
  project: ShowProject;
  fixtures: Fixture[];
  cueScenes: CueScene[];
  tracks: TimelineTrack[];
}

export function createProjectTransferPayload(source: ProjectTransferSource, now: string = new Date().toISOString()): ProjectTransferPayload {
  const sceneIds = new Set(source.tracks.map((track) => track.cue_scene_id));
  const activeSceneIds = new Set(
    source.cueScenes
      .filter((scene) => sceneIds.has(scene.id) && scene.scene_status !== CUE_STATUS_ARCHIVED)
      .map((scene) => scene.id)
  );
  const tracks = source.tracks.filter((track) => activeSceneIds.has(track.cue_scene_id));
  return {
    format: PROJECT_TRANSFER_FORMAT,
    version: PROJECT_TRANSFER_VERSION,
    exported_at: now,
    project: source.project,
    fixtures: source.fixtures,
    cue_scenes: source.cueScenes.filter((scene) => activeSceneIds.has(scene.id)),
    tracks
  };
}

export function isProjectTransferPayload(value: unknown): value is ProjectTransferPayload {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    data.format === PROJECT_TRANSFER_FORMAT &&
    typeof data.version === "number" &&
    typeof data.project === "object" &&
    data.project !== null &&
    Array.isArray(data.fixtures) &&
    Array.isArray(data.cue_scenes) &&
    Array.isArray(data.tracks)
  );
}
