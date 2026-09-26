import type { ShowProject } from "../types/ShowProject";
import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowTransferBundle, TransferIssue, TransferMergeResult } from "../types/ShowTransfer";
import { TRANSFER_KIND, TRANSFER_FORMAT_VERSION } from "../constants/transferFormat";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createTransferIssue, createEmptyTransferMergeCount, parseSceneFixtureRefs } from "../constructors/ShowTransferConstructor";
import { findFirstDmxConflict, formatDmxRange } from "./dmx";

export interface TransferCollections {
  projects: ShowProject[];
  fixtures: Fixture[];
  scenes: CueScene[];
  tracks: TimelineTrack[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** 第一步：解析文本并核对格式版本 */
export function parseTransferBundle(text: string): { ok: true; bundle: ShowTransferBundle } | { ok: false; issue: TransferIssue } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      ok: false,
      issue: createTransferIssue(ERROR_CODES.TRANSFER_PARSE_ERROR, ERROR_MESSAGES.TRANSFER_PARSE_ERROR, "粘贴的内容不是 JSON 文本")
    };
  }
  if (
    !isRecord(raw) ||
    raw.kind !== TRANSFER_KIND ||
    !isRecord(raw.project) ||
    !Array.isArray(raw.fixtures) ||
    !Array.isArray(raw.scenes) ||
    !Array.isArray(raw.tracks)
  ) {
    return {
      ok: false,
      issue: createTransferIssue(ERROR_CODES.TRANSFER_PARSE_ERROR, ERROR_MESSAGES.TRANSFER_PARSE_ERROR, "缺少 kind/project/fixtures/scenes/tracks 字段")
    };
  }
  if (raw.version !== TRANSFER_FORMAT_VERSION) {
    return {
      ok: false,
      issue: createTransferIssue(
        ERROR_CODES.TRANSFER_VERSION_MISMATCH,
        ERROR_MESSAGES.TRANSFER_VERSION_MISMATCH,
        `当前支持 v${TRANSFER_FORMAT_VERSION}，收到 v${String(raw.version)}`
      )
    };
  }
  return { ok: true, bundle: raw as unknown as ShowTransferBundle };
}

const newerFirst = <T extends { id: number; updated_at: string }>(incoming: T, existing: T): T =>
  Date.parse(incoming.updated_at) > Date.parse(existing.updated_at) ? incoming : existing;

/**
 * 按编号合并：同编号保留 updated_at 较新的一份；
 * 已归档（ARCHIVED）场景不参与合并——包里的归档场景不导入，本地已归档场景不被覆盖。
 */
export function mergeTransferBundle(bundle: ShowTransferBundle, current: TransferCollections): TransferMergeResult {
  const projects = { ...createEmptyTransferMergeCount() };
  const fixtures = { ...createEmptyTransferMergeCount() };
  const scenes = { ...createEmptyTransferMergeCount() };
  const tracks = { ...createEmptyTransferMergeCount() };

  const mergeById = <T extends { id: number; updated_at: string }>(
    currentRows: T[],
    incomingRows: T[],
    count: { added: number; updated: number; kept: number; skipped: number },
    skip?: (row: T) => boolean
  ): T[] => {
    const byId = new Map<number, T>(currentRows.map((row) => [row.id, row]));
    for (const incoming of incomingRows) {
      if (skip?.(incoming)) {
        count.skipped += 1;
        continue;
      }
      const existing = byId.get(incoming.id);
      if (!existing) {
        byId.set(incoming.id, incoming);
        count.added += 1;
      } else if (skip?.(existing)) {
        count.skipped += 1;
      } else if (newerFirst(incoming, existing) === incoming) {
        byId.set(incoming.id, incoming);
        count.updated += 1;
      } else {
        count.kept += 1;
      }
    }
    return [...byId.values()].sort((a, b) => a.id - b.id);
  };

  const isArchived = (scene: CueScene) => scene.scene_status === "ARCHIVED";

  return {
    projects: mergeById(current.projects, [bundle.project], projects),
    fixtures: mergeById(current.fixtures, bundle.fixtures, fixtures),
    scenes: mergeById(current.scenes, bundle.scenes, scenes, isArchived),
    tracks: mergeById(current.tracks, bundle.tracks, tracks),
    summary: { projects, fixtures, scenes, tracks }
  };
}

/** 第二步：核对合并后引用的灯具和场景是否都在 */
export function findFirstMissingReference(bundle: ShowTransferBundle, merged: TransferMergeResult): TransferIssue | null {
  const fixtureIds = new Set(merged.fixtures.map((fixture) => fixture.id));
  const sceneIds = new Set(merged.scenes.map((scene) => scene.id));
  const trackIds = new Set(merged.tracks.map((track) => track.id));

  for (const fixtureId of bundle.project.fixture_ids) {
    if (!fixtureIds.has(fixtureId)) {
      return createTransferIssue(
        ERROR_CODES.TRANSFER_REFERENCE_MISSING,
        ERROR_MESSAGES.TRANSFER_REFERENCE_MISSING,
        `方案「${bundle.project.title}」(#${bundle.project.id}) 引用的灯具 #${fixtureId} 不存在`
      );
    }
  }
  for (const trackId of bundle.project.track_ids) {
    if (!trackIds.has(trackId)) {
      return createTransferIssue(
        ERROR_CODES.TRANSFER_REFERENCE_MISSING,
        ERROR_MESSAGES.TRANSFER_REFERENCE_MISSING,
        `方案「${bundle.project.title}」(#${bundle.project.id}) 引用的轨道 #${trackId} 不存在`
      );
    }
  }
  for (const track of bundle.tracks) {
    if (!sceneIds.has(track.cue_scene_id)) {
      return createTransferIssue(
        ERROR_CODES.TRANSFER_REFERENCE_MISSING,
        ERROR_MESSAGES.TRANSFER_REFERENCE_MISSING,
        `轨道 #${track.id} 引用的场景 #${track.cue_scene_id} 不存在`
      );
    }
  }
  for (const scene of bundle.scenes) {
    for (const fixtureId of parseSceneFixtureRefs(scene)) {
      if (!fixtureIds.has(fixtureId)) {
        return createTransferIssue(
          ERROR_CODES.TRANSFER_REFERENCE_MISSING,
          ERROR_MESSAGES.TRANSFER_REFERENCE_MISSING,
          `场景「${scene.name}」(#${scene.id}) 引用的灯具 #${fixtureId} 不存在`
        );
      }
    }
  }
  return null;
}

/** 第三步：核对合并后没有两盏灯占用同一段 DMX 地址 */
export function findFirstDmxIssue(merged: TransferMergeResult): TransferIssue | null {
  const conflict = findFirstDmxConflict(merged.fixtures);
  if (!conflict) return null;
  return createTransferIssue(
    ERROR_CODES.TRANSFER_DMX_CONFLICT,
    ERROR_MESSAGES.TRANSFER_DMX_CONFLICT,
    `灯具 ${conflict.a.fixture_code}（#${conflict.a.id}，地址 ${formatDmxRange(conflict.rangeA)}）与灯具 ${conflict.b.fixture_code}（#${conflict.b.id}，地址 ${formatDmxRange(conflict.rangeB)}）占用同一段地址`
  );
}

/**
 * 导入入口：依次核对格式版本 → 引用完整性 → DMX 地址段，
 * 任一不通过即返回第一条冲突，调用方不得改动当前数据。
 */
export function validateTransferBundle(
  text: string,
  current: TransferCollections
): { ok: true; merged: TransferMergeResult } | { ok: false; issue: TransferIssue } {
  const parsed = parseTransferBundle(text);
  if (!parsed.ok) return parsed;
  const merged = mergeTransferBundle(parsed.bundle, current);
  const missing = findFirstMissingReference(parsed.bundle, merged);
  if (missing) return { ok: false, issue: missing };
  const dmx = findFirstDmxIssue(merged);
  if (dmx) return { ok: false, issue: dmx };
  return { ok: true, merged };
}
