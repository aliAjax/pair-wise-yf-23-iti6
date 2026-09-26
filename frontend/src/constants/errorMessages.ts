import type { TransferConflictKind } from "../types/ProjectTransfer";

export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TRANSFER_UNSUPPORTED_VERSION: "格式版本不受支持：需要 {expected}，实际 {actual}",
  TRANSFER_MALFORMED_PAYLOAD: "内容无法解析，不是有效的演出方案数据（{reason}）",
  TRANSFER_MISSING_FIXTURE: "内容缺少引用的灯具 #{id}",
  TRANSFER_MISSING_SCENE: "内容缺少轨道引用的场景 #{id}",
  TRANSFER_DMX_CONFLICT: "灯具地址冲突：{fixture} 的地址段 {range} 与 {other} 的地址段 {otherRange} 重叠",
  TRANSFER_PERSIST_FAILED: "本地数据写入失败，当前数据保持不变：{reason}"
} as const;

export function renderErrorMessage(code: keyof typeof ERROR_MESSAGES, params: Record<string, string | number> = {}): string {
  const template: string = ERROR_MESSAGES[code];
  return Object.entries(params).reduce<string>(
    (text, [key, value]) => text.split(`{${key}}`).join(String(value)),
    template
  );
}

export const TRANSFER_CONFLICT_KIND_TEXT: Record<TransferConflictKind, string> = {
  UNSUPPORTED_VERSION: "格式版本不符",
  MALFORMED_PAYLOAD: "内容无法识别",
  MISSING_FIXTURE: "缺少灯具",
  MISSING_SCENE: "缺少场景",
  DMX_ADDRESS_CONFLICT: "DMX 地址冲突",
  PERSIST_FAILED: "本地写入失败"
};
