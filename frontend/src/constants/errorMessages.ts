export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TRANSFER_PARSE_ERROR: "走场包内容不是有效的 JSON 或缺少必要字段",
  TRANSFER_VERSION_MISMATCH: "走场包格式版本不受支持",
  TRANSFER_REFERENCE_MISSING: "走场包引用的灯具或场景不存在",
  TRANSFER_DMX_CONFLICT: "存在灯具占用同一段 DMX 地址"
};
