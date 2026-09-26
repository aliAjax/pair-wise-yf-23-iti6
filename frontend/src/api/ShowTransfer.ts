import type { ShowTransferBundle, TransferIssue, TransferMergeResult } from "../types/ShowTransfer";
import { createShowTransferBundle } from "../constructors/ShowTransferConstructor";
import { validateTransferBundle, type TransferCollections } from "../utils/showTransfer";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const endpoint = "/api/show-transfer";

/** 把选中方案打包成可带走的走场包文本（只含方案用到的灯具、场景和轨道） */
export async function exportShowProjectTransfer(
  projectId: number,
  collections: TransferCollections
): Promise<string> {
  const project = collections.projects.find((row) => row.id === projectId);
  if (!project) throw new Error(`ShowProject #${projectId} not found at ${endpoint}`);
  const bundle: ShowTransferBundle = createShowTransferBundle(
    project,
    collections.fixtures,
    collections.scenes,
    collections.tracks
  );
  console.info(LOG_TEMPLATES.ShowProject[3], {
    projectId,
    fixtures: bundle.fixtures.length,
    scenes: bundle.scenes.length,
    tracks: bundle.tracks.length
  });
  return JSON.stringify(bundle, null, 2);
}

/** 校验并合并走场包；失败时返回第一条冲突，当前数据照旧 */
export async function importShowProjectTransfer(
  text: string,
  current: TransferCollections
): Promise<{ ok: true; merged: TransferMergeResult } | { ok: false; issue: TransferIssue }> {
  const result = validateTransferBundle(text, current);
  if (!result.ok) {
    console.warn(LOG_TEMPLATES.ShowProject[4], result.issue);
    return result;
  }
  console.info(LOG_TEMPLATES.ShowProject[4], result.merged.summary);
  console.info(LOG_TEMPLATES.Fixture[4], result.merged.summary.fixtures);
  console.info(LOG_TEMPLATES.CueScene[4], result.merged.summary.scenes);
  console.info(LOG_TEMPLATES.TimelineTrack[4], result.merged.summary.tracks);
  return result;
}
