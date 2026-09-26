import { useState } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { exportProject, importProjectContent, ProjectTransferError } from "../controllers/ProjectTransferController";
import type { ShowProject } from "../types/ShowProject";
import type { TransferConflict, TransferImportReport } from "../types/ProjectTransfer";

export function useProjectTransfer() {
  const fixtures = useFixtureStore((state) => state.rows);
  const cueScenes = useCueSceneStore((state) => state.rows);
  const tracks = useTimelineTrackStore((state) => state.rows);
  const projects = useShowProjectStore((state) => state.rows);
  const setFixtures = useFixtureStore((state) => state.setRows);
  const setCueScenes = useCueSceneStore((state) => state.setRows);
  const setTracks = useTimelineTrackStore((state) => state.setRows);
  const setProjects = useShowProjectStore((state) => state.setRows);

  const [exportContent, setExportContent] = useState("");
  const [importContent, setImportContent] = useState("");
  const [conflict, setConflict] = useState<TransferConflict | null>(null);
  const [report, setReport] = useState<TransferImportReport | null>(null);
  const [busy, setBusy] = useState(false);

  const buildExport = (project: ShowProject) => {
    const result = exportProject({ project, fixtures, cueScenes, tracks });
    setExportContent(result.content);
    setConflict(null);
    setReport(null);
    return result;
  };

  const submitImport = async () => {
    setBusy(true);
    setConflict(null);
    setReport(null);
    try {
      const result = await importProjectContent({
        content: importContent,
        fixtures,
        cueScenes,
        tracks,
        projects
      });
      setFixtures(result.merged.fixtures);
      setCueScenes(result.merged.cueScenes);
      setTracks(result.merged.tracks);
      setProjects(result.merged.projects);
      setReport(result.report);
      return result.report;
    } catch (error) {
      if (error instanceof ProjectTransferError) {
        setConflict(error.conflict);
      } else {
        setConflict({
          kind: "PERSIST_FAILED",
          message: error instanceof Error ? error.message : "导入失败，当前数据保持不变"
        });
      }
      return null;
    } finally {
      setBusy(false);
    }
  };

  return {
    exportContent,
    importContent,
    setImportContent,
    conflict,
    report,
    busy,
    buildExport,
    submitImport
  };
}
