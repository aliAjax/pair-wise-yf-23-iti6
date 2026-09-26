import type { ShowProject } from "./ShowProject";
import type { Fixture } from "./Fixture";
import type { CueScene } from "./CueScene";
import type { TimelineTrack } from "./TimelineTrack";

/** 巡演换场走场包：只装方案用到的灯具、场景和轨道 */
export interface ShowTransferBundle {
  kind: string;
  version: number;
  exported_at: string;
  project: ShowProject;
  fixtures: Fixture[];
  scenes: CueScene[];
  tracks: TimelineTrack[];
}

/** 校验失败时指向的第一条冲突 */
export interface TransferIssue {
  code: string;
  message: string;
  detail: string;
}

export interface TransferMergeCount {
  added: number;
  updated: number;
  kept: number;
  skipped: number;
}

export interface TransferMergeSummary {
  projects: TransferMergeCount;
  fixtures: TransferMergeCount;
  scenes: TransferMergeCount;
  tracks: TransferMergeCount;
}

/** 合并后的全量数据 + 各集合合并统计 */
export interface TransferMergeResult {
  projects: ShowProject[];
  fixtures: Fixture[];
  scenes: CueScene[];
  tracks: TimelineTrack[];
  summary: TransferMergeSummary;
}
