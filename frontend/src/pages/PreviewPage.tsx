import { useEffect } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useProjectTransfer } from "../hooks/useProjectTransfer";
import { ProjectTransferPanel } from "../components/common/ProjectTransferPanel";
import { StageCanvas } from "../components/common/StageCanvas";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { StatusBadge } from "../components/common/StatusBadge";

export function PreviewPage() {
  const loadFixtures = useFixtureStore((state) => state.load);
  const loadCueScenes = useCueSceneStore((state) => state.load);
  const loadTracks = useTimelineTrackStore((state) => state.load);
  const loadProjects = useShowProjectStore((state) => state.load);
  const projects = useShowProjectStore((state) => state.rows);
  const loading = useShowProjectStore((state) => state.loading);
  const transfer = useProjectTransfer();

  useEffect(() => {
    void loadFixtures();
    void loadCueScenes();
    void loadTracks();
    void loadProjects();
  }, [loadFixtures, loadCueScenes, loadTracks, loadProjects]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>舞台预览</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <section className="workbench">
        <div className="panel wide">
          <h2>舞台画面</h2>
          <StageCanvas title="二维舞台预览" value="READY" />
          <TimelineRuler title="播放时间轴" value="READY" />
        </div>
        <div className="panel">
          <h2>方案数据</h2>
          <p>{loading ? "加载中…" : `本机共 ${projects.length} 份演出方案，可选中后生成可携带内容。`}</p>
        </div>
      </section>
      <ProjectTransferPanel
        projects={projects}
        exportContent={transfer.exportContent}
        importContent={transfer.importContent}
        conflict={transfer.conflict}
        report={transfer.report}
        busy={transfer.busy}
        onExport={transfer.buildExport}
        onImportChange={transfer.setImportContent}
        onImport={() => void transfer.submitImport()}
      />
    </main>
  );
}
