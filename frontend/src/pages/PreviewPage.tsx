import { useEffect, useMemo, useState } from "react";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { exportShowProjectTransfer, importShowProjectTransfer } from "../api/ShowTransfer";
import { createShowTransferBundle } from "../constructors/ShowTransferConstructor";
import type { TransferIssue, TransferMergeSummary } from "../types/ShowTransfer";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { StageCanvas } from "../components/common/StageCanvas";
import { formatDate } from "../utils/formatters";
import { formatDmxRange } from "../utils/dmx";

const countLabels: Array<[keyof TransferMergeSummary, string]> = [
  ["projects", "方案"],
  ["fixtures", "灯具"],
  ["scenes", "场景"],
  ["tracks", "轨道"]
];

export function PreviewPage() {
  const projects = useShowProjectStore((state) => state.rows);
  const fixtures = useFixtureStore((state) => state.rows);
  const scenes = useCueSceneStore((state) => state.rows);
  const tracks = useTimelineTrackStore((state) => state.rows);

  const [projectId, setProjectId] = useState<number | null>(null);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [issue, setIssue] = useState<TransferIssue | null>(null);
  const [summary, setSummary] = useState<TransferMergeSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void useShowProjectStore.getState().load();
    void useFixtureStore.getState().load();
    void useCueSceneStore.getState().load();
    void useTimelineTrackStore.getState().load();
  }, []);

  const project = projects.find((row) => row.id === projectId) ?? projects[0] ?? null;

  const bundlePreview = useMemo(
    () => (project ? createShowTransferBundle(project, fixtures, scenes, tracks) : null),
    [project, fixtures, scenes, tracks]
  );

  const { conflict } = useDmxAddressCheck(fixtures);

  const handleExport = async () => {
    if (!project) return;
    const text = await exportShowProjectTransfer(project.id, { projects, fixtures, scenes, tracks });
    setExportText(text);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!project) return;
    const blob = new Blob([exportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `show-transfer-${project.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setIssue(null);
    setSummary(null);
    const result = await importShowProjectTransfer(importText, { projects, fixtures, scenes, tracks });
    if (!result.ok) {
      // 校验不通过：只展示第一条冲突，当前数据照旧
      setIssue(result.issue);
      return;
    }
    useShowProjectStore.getState().replaceRows(result.merged.projects);
    useFixtureStore.getState().replaceRows(result.merged.fixtures);
    useCueSceneStore.getState().replaceRows(result.merged.scenes);
    useTimelineTrackStore.getState().replaceRows(result.merged.tracks);
    setSummary(result.merged.summary);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>舞台预览</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <section className="metrics">
        <StatCard label="演出方案" value={projects.length} />
        <StatCard label="灯具" value={fixtures.length} />
        <StatCard label="场景" value={scenes.length} />
        <StatCard label="轨道" value={tracks.length} />
      </section>

      {conflict && (
        <section className="transfer-result error">
          当前灯具地址有冲突：{conflict.a.fixture_code}（{formatDmxRange(conflict.rangeA)}）与{" "}
          {conflict.b.fixture_code}（{formatDmxRange(conflict.rangeB)}）占用同一段地址
        </section>
      )}

      <section className="workbench">
        <div className="panel wide">
          <h2>巡演换场 · 导出走场包</h2>
          <div className="transfer-toolbar">
            <select value={project?.id ?? ""} onChange={(event) => setProjectId(Number(event.target.value))}>
              {projects.map((row) => (
                <option key={row.id} value={row.id}>
                  #{row.id} {row.title}（{row.venue_name}）
                </option>
              ))}
            </select>
            <button className="primary" onClick={() => void handleExport()} disabled={!project}>
              生成走场包
            </button>
          </div>
          {project && bundlePreview && (
            <p className="transfer-hint">
              方案「{project.title}」更新于 {formatDate(project.updated_at)}，走场包只含用到的{" "}
              {bundlePreview.fixtures.length} 盏灯具、{bundlePreview.scenes.length} 个场景、
              {bundlePreview.tracks.length} 条轨道。
            </p>
          )}
          {exportText && (
            <>
              <textarea readOnly rows={10} value={exportText} onFocus={(event) => event.target.select()} />
              <div className="transfer-toolbar">
                <button onClick={() => void handleCopy()}>{copied ? "已复制" : "复制到剪贴板"}</button>
                <button onClick={handleDownload}>下载 JSON 文件</button>
              </div>
            </>
          )}
        </div>

        <div className="panel">
          <StageCanvas title="StageCanvas" value={project ? "READY" : "DRAFT"} />
        </div>
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>贴回走场包并导入</h2>
          <textarea
            rows={8}
            placeholder='把别的机器导出的走场包 JSON 粘贴到这里，点击"校验并合并"'
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
          />
          <div className="transfer-toolbar">
            <button className="primary" onClick={() => void handleImport()} disabled={!importText.trim()}>
              校验并合并
            </button>
          </div>
          {issue && (
            <div className="transfer-result error">
              <strong>导入未生效，当前数据照旧。第一条冲突：</strong>
              <StatusBadge value={issue.code} />
              <p>{issue.message}：{issue.detail}</p>
            </div>
          )}
          {summary && (
            <div className="transfer-result ok">
              <strong>合并完成（按编号合并，同编号留最后改过的，已归档场景不参与）：</strong>
              <ul>
                {countLabels.map(([key, label]) => (
                  <li key={key}>
                    {label}：新增 {summary[key].added}，更新 {summary[key].updated}，保留{" "}
                    {summary[key].kept}，跳过 {summary[key].skipped}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>合并规则</h2>
          <p>导入前依次核对：格式版本 → 引用的灯具和场景是否在 → 是否有灯具占用同一段 DMX 地址。任一不通过即点出第一条冲突，当前数据照旧。</p>
        </div>
      </section>
    </main>
  );
}
