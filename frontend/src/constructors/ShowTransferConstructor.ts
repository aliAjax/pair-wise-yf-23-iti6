import type { ShowProject } from "../types/ShowProject";
import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowTransferBundle, TransferIssue, TransferMergeCount } from "../types/ShowTransfer";
import { TRANSFER_KIND, TRANSFER_FORMAT_VERSION } from "../constants/transferFormat";

/**
 * 组装巡演走场包：只保留方案用到的灯具、场景和轨道。
 * 场景集合 = 方案轨道引用到的场景；灯具集合 = 方案 fixture_ids 与场景 fixture_states 引用到的灯具的并集。
 */
export const createShowTransferBundle = (
  project: ShowProject,
  allFixtures: Fixture[],
  allScenes: CueScene[],
  allTracks: TimelineTrack[]
): ShowTransferBundle => {
  const tracks = allTracks.filter((track) => project.track_ids.includes(track.id));
  const sceneIds = new Set(tracks.map((track) => track.cue_scene_id));
  const scenes = allScenes.filter((scene) => sceneIds.has(scene.id));
  const fixtureIds = new Set(project.fixture_ids);
  for (const scene of scenes) {
    for (const ref of parseSceneFixtureRefs(scene)) fixtureIds.add(ref);
  }
  const fixtures = allFixtures.filter((fixture) => fixtureIds.has(fixture.id));
  return {
    kind: TRANSFER_KIND,
    version: TRANSFER_FORMAT_VERSION,
    exported_at: new Date().toISOString(),
    project,
    fixtures,
    scenes,
    tracks
  };
};

/** 场景 fixture_states 是 JSON 字符串，键为灯具编号；解析失败视为没有引用 */
export const parseSceneFixtureRefs = (scene: CueScene): number[] => {
  try {
    const parsed: unknown = JSON.parse(scene.fixture_states);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.keys(parsed as Record<string, unknown>)
      .map((key) => Number(key))
      .filter((id) => Number.isInteger(id));
  } catch {
    return [];
  }
};

export const createTransferIssue = (code: string, message: string, detail: string): TransferIssue => ({
  code,
  message,
  detail
});

export const createEmptyTransferMergeCount = (): TransferMergeCount => ({
  added: 0,
  updated: 0,
  kept: 0,
  skipped: 0
});
