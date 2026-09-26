import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowProject } from "../types/ShowProject";
import type { ProjectTransferPayload, TransferConflict, TransferImportReport } from "../types/ProjectTransfer";
import { buildProjectExport } from "../services/projectExportService";
import { parseTransferContent, validateTransferPayload } from "../services/projectValidationService";
import { mergeProjectTransfer } from "../services/projectMergeService";
import { saveFixture } from "../api/Fixture";
import { saveCueScene } from "../api/CueScene";
import { saveTimelineTrack } from "../api/TimelineTrack";
import { saveShowProject } from "../api/ShowProject";
import { renderErrorMessage } from "../constants/errorMessages";
import { PROJECT_TRANSFER_LOGS } from "../constants/logTemplates";

export class ProjectTransferError extends Error {
  constructor(public readonly conflict: TransferConflict) {
    super(conflict.message);
    this.name = "ProjectTransferError";
  }
}

export function exportProject(params: {
  project: ShowProject;
  fixtures: Fixture[];
  cueScenes: CueScene[];
  tracks: TimelineTrack[];
}) {
  const result = buildProjectExport(params);
  console.info(PROJECT_TRANSFER_LOGS.EXPORTED, { projectId: params.project.id, stats: result.stats });
  return result;
}

export async function importProjectContent(params: {
  content: string;
  fixtures: Fixture[];
  cueScenes: CueScene[];
  tracks: TimelineTrack[];
  projects: ShowProject[];
}): Promise<{ payload: ProjectTransferPayload; merged: ReturnType<typeof mergeProjectTransfer>; report: TransferImportReport }> {
  const parsed = parseTransferContent(params.content);
  if (!parsed.ok) {
    console.warn(PROJECT_TRANSFER_LOGS.IMPORT_REJECTED, parsed.conflict);
    throw new ProjectTransferError(parsed.conflict);
  }
  const { payload } = parsed;

  const conflict = validateTransferPayload({ payload, localFixtures: params.fixtures });
  if (conflict) {
    console.warn(PROJECT_TRANSFER_LOGS.IMPORT_REJECTED, conflict);
    throw new ProjectTransferError(conflict);
  }

  const merged = mergeProjectTransfer({
    payload,
    fixtures: params.fixtures,
    cueScenes: params.cueScenes,
    tracks: params.tracks,
    projects: params.projects
  });

  try {
    await Promise.all(merged.fixtures.map((row) => saveFixture(row)));
    await Promise.all(merged.cueScenes.map((row) => saveCueScene(row)));
    await Promise.all(merged.tracks.map((row) => saveTimelineTrack(row)));
    await Promise.all(merged.projects.map((row) => saveShowProject(row)));
  } catch (error) {
    throw new ProjectTransferError({
      kind: "PERSIST_FAILED",
      message: renderErrorMessage("TRANSFER_PERSIST_FAILED", {
        reason: error instanceof Error ? error.message : "IndexedDB 写入异常"
      })
    });
  }

  console.info(PROJECT_TRANSFER_LOGS.IMPORT_MERGED, { projectId: payload.project.id, report: merged.report });
  return { payload, merged, report: merged.report };
}
