export const PROJECT_TRANSFER_LOGS = {
  EXPORTED: "演出方案导出为可携带内容",
  IMPORT_REJECTED: "演出方案导入校验未通过",
  IMPORT_MERGED: "演出方案导入合并完成",
  IMPORT_UNSUPPORTED: "演出方案内容格式不受支持"
} as const;

export const LOG_TEMPLATES = {
  Fixture: ["灯具创建", "灯具更新", "灯具状态变更", "灯具导出"],
  CueScene: ["灯光场景创建", "灯光场景更新", "灯光场景状态变更", "灯光场景导出"],
  TimelineTrack: ["时间轴轨道创建", "时间轴轨道更新", "时间轴轨道状态变更", "时间轴轨道导出"],
  ShowProject: ["演出方案创建", "演出方案更新", "演出方案状态变更", "演出方案导出"],
  ProjectTransfer: [
    PROJECT_TRANSFER_LOGS.EXPORTED,
    PROJECT_TRANSFER_LOGS.IMPORT_REJECTED,
    PROJECT_TRANSFER_LOGS.IMPORT_MERGED,
    PROJECT_TRANSFER_LOGS.IMPORT_UNSUPPORTED
  ]
};
