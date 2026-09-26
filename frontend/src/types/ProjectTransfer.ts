import type { Fixture } from "./Fixture";
import type { CueScene } from "./CueScene";
import type { TimelineTrack } from "./TimelineTrack";
import type { ShowProject } from "./ShowProject";

export interface ProjectTransferPayload {
  format: string;
  version: number;
  exported_at: string;
  project: ShowProject;
  fixtures: Fixture[];
  cue_scenes: CueScene[];
  tracks: TimelineTrack[];
}

export type TransferConflictKind =
  | "UNSUPPORTED_VERSION"
  | "MALFORMED_PAYLOAD"
  | "MISSING_FIXTURE"
  | "MISSING_SCENE"
  | "DMX_ADDRESS_CONFLICT"
  | "PERSIST_FAILED";

export interface TransferConflict {
  kind: TransferConflictKind;
  message: string;
}

export interface TransferImportReport {
  fixtures: { inserted: number; updated: number };
  cueScenes: { inserted: number; updated: number; skippedArchived: number };
  tracks: { inserted: number; updated: number; skipped: number };
  project: "inserted" | "updated" | "kept_local";
}
