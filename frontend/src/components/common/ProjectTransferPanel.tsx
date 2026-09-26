import { useState } from "react";
import type { ShowProject } from "../../types/ShowProject";
import type { TransferConflict, TransferImportReport } from "../../types/ProjectTransfer";
import { TRANSFER_CONFLICT_KIND_TEXT } from "../../constants/errorMessages";
import { formatDate } from "../../utils/formatters";
import { EmptyState } from "./EmptyState";

interface ProjectTransferPanelProps {
  projects: ShowProject[];
  exportContent: string;
  importContent: string;
  conflict: TransferConflict | null;
  report: TransferImportReport | null;
  busy: boolean;
  onExport: (project: ShowProject) => void;
  onImportChange: (content: string) => void;
  onImport: () => void;
}

export function ProjectTransferPanel({
  projects,
  exportContent,
  importContent,
  conflict,
  report,
  busy,
  onExport,
  onImportChange,
  onImport
}: ProjectTransferPanelProps) {
  const [selectedId, setSelectedId] = useState<number | "">(projects[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const selected = projects.find((project) => project.id === selectedId) ?? null;

  const handleCopy = async () => {
    if (!exportContent) return;
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const area = document.querySelector<HTMLTextAreaElement>("[data-transfer-export]");
      area?.select();
      document.execCommand("copy");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="panel transfer-panel">
      <h2>方案带走 / 带回</h2>
      {projects.length === 0 ? (
        <EmptyState title="暂无可导出的演出方案" />
      ) : (
        <div className="transfer-field">
          <label htmlFor="project-select">选中方案</label>
          <select
            id="project-select"
            value={selectedId}
            onChange={(event) => setSelectedId(Number(event.target.value))}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {`#${project.id} ${project.title}（${project.venue_name}）`}
              </option>
            ))}
          </select>
          {selected && <p className="transfer-hint">最后改动：{formatDate(selected.updated_at)}</p>}
          <button className="transfer-btn primary" type="button" disabled={!selected} onClick={() => selected && onExport(selected)}>
            生成可携带内容
          </button>
        </div>
      )}

      {exportContent && (
        <div className="transfer-field">
          <label>导出内容（只含本方案用到的灯具、场景和轨道）</label>
          <textarea className="transfer-text" data-transfer-export readOnly rows={8} value={exportContent} />
          <button className="transfer-btn" type="button" onClick={handleCopy}>
            {copied ? "已复制" : "复制全部"}
          </button>
        </div>
      )}

      <div className="transfer-field">
        <label htmlFor="project-import">贴回导入</label>
        <textarea
          id="project-import"
          className="transfer-text"
          rows={8}
          placeholder="把另一台机器复制的方案内容粘贴到这里"
          value={importContent}
          onChange={(event) => onImportChange(event.target.value)}
        />
        <button className="transfer-btn primary" type="button" disabled={busy || importContent.trim().length === 0} onClick={onImport}>
          {busy ? "核对中…" : "核对并导入"}
        </button>
      </div>

      {conflict && (
        <div className="transfer-conflict" role="alert">
          <strong>第一条冲突 · {TRANSFER_CONFLICT_KIND_TEXT[conflict.kind]}</strong>
          <span>{conflict.message}</span>
          <span className="transfer-conflict-note">导入已中止，当前数据照旧。</span>
        </div>
      )}

      {report && (
        <div className="transfer-report" role="status">
          <strong>导入完成，已按编号合并</strong>
          <ul>
            <li>灯具：新增 {report.fixtures.inserted}，覆盖 {report.fixtures.updated}</li>
            <li>场景：新增 {report.cueScenes.inserted}，覆盖 {report.cueScenes.updated}，归档跳过 {report.cueScenes.skippedArchived}</li>
            <li>轨道：新增 {report.tracks.inserted}，覆盖 {report.tracks.updated}，随归档场景跳过 {report.tracks.skipped}</li>
            <li>
              方案：
              {report.project === "inserted"
                ? "本机不存在，已新增"
                : report.project === "updated"
                  ? "同编号方案以最后改过的一份覆盖"
                  : "本机版本更新，保留本机方案"}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
