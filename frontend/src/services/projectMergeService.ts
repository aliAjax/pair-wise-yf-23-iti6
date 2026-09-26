import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowProject } from "../types/ShowProject";
import type { ProjectTransferPayload, TransferImportReport } from "../types/ProjectTransfer";
import { CUE_STATUS_ARCHIVED } from "../constants/CueStatus";

function mergeById<T extends { id: number }>(local: T[], incoming: T[]) {
  const incomingMap = new Map(incoming.map((row) => [row.id, row]));
  const localMap = new Map(local.map((row) => [row.id, row]));
  let inserted = 0;
  let updated = 0;
  const merged = new Map<number, T>(local.map((row) => [row.id, row]));
  incomingMap.forEach((row, id) => {
    if (localMap.has(id)) updated += 1;
    else inserted += 1;
    merged.set(id, row);
  });
  return { rows: [...merged.values()], inserted, updated };
}

export function mergeProjectTransfer(params: {
  payload: ProjectTransferPayload;
  fixtures: Fixture[];
  cueScenes: CueScene[];
  tracks: TimelineTrack[];
  projects: ShowProject[];
}): {
  fixtures: Fixture[];
  cueScenes: CueScene[];
  tracks: TimelineTrack[];
  projects: ShowProject[];
  report: TransferImportReport;
} {
  const { payload } = params;

  const fixtureMerge = mergeById(params.fixtures, payload.fixtures);

  const archivedIncoming = payload.cue_scenes.filter((scene) => scene.scene_status === CUE_STATUS_ARCHIVED);
  const activeScenes = payload.cue_scenes.filter((scene) => scene.scene_status !== CUE_STATUS_ARCHIVED);
  const sceneMerge = mergeById(params.cueScenes, activeScenes);

  const activeSceneIds = new Set(activeScenes.map((scene) => scene.id));
  const activeTracks = payload.tracks.filter((track) => activeSceneIds.has(track.cue_scene_id));
  const trackMerge = mergeById(params.tracks, activeTracks);

  const localProject = params.projects.find((item) => item.id === payload.project.id);
  const projectWins =
    !localProject || new Date(payload.project.updated_at).getTime() >= new Date(localProject.updated_at).getTime();
  const projectMap = new Map(params.projects.map((item) => [item.id, item]));
  if (projectWins) projectMap.set(payload.project.id, payload.project);

  return {
    fixtures: fixtureMerge.rows,
    cueScenes: sceneMerge.rows,
    tracks: trackMerge.rows,
    projects: [...projectMap.values()],
    report: {
      fixtures: { inserted: fixtureMerge.inserted, updated: fixtureMerge.updated },
      cueScenes: {
        inserted: sceneMerge.inserted,
        updated: sceneMerge.updated,
        skippedArchived: archivedIncoming.length
      },
      tracks: {
        inserted: trackMerge.inserted,
        updated: trackMerge.updated,
        skipped: payload.tracks.length - activeTracks.length
      },
      project: !localProject ? "inserted" : projectWins ? "updated" : "kept_local"
    }
  };
}
