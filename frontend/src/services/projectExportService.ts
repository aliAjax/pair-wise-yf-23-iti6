import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowProject } from "../types/ShowProject";
import { createProjectTransferPayload } from "../constructors/ProjectTransferConstructor";

export function buildProjectExport(params: {
  project: ShowProject;
  fixtures: Fixture[];
  cueScenes: CueScene[];
  tracks: TimelineTrack[];
}) {
  const projectTracks = params.tracks.filter((track) => params.project.track_ids.includes(track.id));
  const projectFixtures = params.fixtures.filter((fixture) => params.project.fixture_ids.includes(fixture.id));
  const payload = createProjectTransferPayload({
    project: params.project,
    fixtures: projectFixtures,
    cueScenes: params.cueScenes,
    tracks: projectTracks
  });
  return {
    payload,
    content: JSON.stringify(payload, null, 2),
    stats: {
      fixtures: payload.fixtures.length,
      cueScenes: payload.cue_scenes.length,
      tracks: payload.tracks.length
    }
  };
}
