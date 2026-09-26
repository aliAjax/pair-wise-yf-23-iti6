import type { Fixture } from "../types/Fixture";
import type { ProjectTransferPayload, TransferConflict } from "../types/ProjectTransfer";
import { isProjectTransferPayload } from "../constructors/ProjectTransferConstructor";
import { PROJECT_TRANSFER_FORMAT, PROJECT_TRANSFER_VERSION } from "../constants/transferFormat";
import { renderErrorMessage } from "../constants/errorMessages";
import { parseDmxRange, dmxRangesOverlap, formatDmxRange } from "../utils/dmx";

function conflict(kind: TransferConflict["kind"], message: string): TransferConflict {
  return { kind, message };
}

export type ParseTransferResult =
  | { ok: true; payload: ProjectTransferPayload }
  | { ok: false; conflict: TransferConflict };

export function parseTransferContent(content: string): ParseTransferResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return {
      ok: false,
      conflict: conflict(
        "MALFORMED_PAYLOAD",
        renderErrorMessage("TRANSFER_MALFORMED_PAYLOAD", { reason: error instanceof Error ? error.message : "JSON 解析失败" })
      )
    };
  }
  if (!isProjectTransferPayload(parsed)) {
    return {
      ok: false,
      conflict: conflict(
        "MALFORMED_PAYLOAD",
        renderErrorMessage("TRANSFER_MALFORMED_PAYLOAD", { reason: "缺少必需字段或 format 不匹配" })
      )
    };
  }
  return { ok: true, payload: parsed };
}

export function validateTransferPayload(params: {
  payload: ProjectTransferPayload;
  localFixtures: Fixture[];
}): TransferConflict | null {
  const { payload, localFixtures } = params;

  if (payload.format !== PROJECT_TRANSFER_FORMAT || payload.version !== PROJECT_TRANSFER_VERSION) {
    return conflict(
      "UNSUPPORTED_VERSION",
      renderErrorMessage("TRANSFER_UNSUPPORTED_VERSION", {
        expected: `${PROJECT_TRANSFER_FORMAT} v${PROJECT_TRANSFER_VERSION}`,
        actual: `${payload.format ?? "未知格式"} v${payload.version ?? "?"}`
      })
    );
  }

  const project = payload.project;
  const fixtureIds = new Set(payload.fixtures.map((fixture) => fixture.id));
  const sceneIds = new Set(payload.cue_scenes.map((scene) => scene.id));

  const missingFixtureId = project.fixture_ids.find((id) => !fixtureIds.has(id));
  if (missingFixtureId !== undefined) {
    return conflict("MISSING_FIXTURE", renderErrorMessage("TRANSFER_MISSING_FIXTURE", { id: missingFixtureId }));
  }

  const missingSceneTrack = payload.tracks.find((track) => !sceneIds.has(track.cue_scene_id));
  if (missingSceneTrack) {
    return conflict(
      "MISSING_SCENE",
      renderErrorMessage("TRANSFER_MISSING_SCENE", { id: missingSceneTrack.cue_scene_id })
    );
  }

  const danglingTrack = payload.tracks.find((track) => !project.track_ids.includes(track.id));
  if (danglingTrack) {
    return conflict(
      "MALFORMED_PAYLOAD",
      renderErrorMessage("TRANSFER_MALFORMED_PAYLOAD", { reason: `轨道 #${danglingTrack.id} 不在方案 track_ids 中` })
    );
  }

  const incomingRanges = payload.fixtures
    .map((fixture) => ({ fixture, range: parseDmxRange(fixture) }))
    .filter((item): item is { fixture: Fixture; range: NonNullable<ReturnType<typeof parseDmxRange>> } => item.range !== null);

  for (let i = 0; i < incomingRanges.length; i += 1) {
    for (let j = i + 1; j < incomingRanges.length; j += 1) {
      if (incomingRanges[i].fixture.id === incomingRanges[j].fixture.id) continue;
      if (dmxRangesOverlap(incomingRanges[i].range, incomingRanges[j].range)) {
        return conflict(
          "DMX_ADDRESS_CONFLICT",
          renderErrorMessage("TRANSFER_DMX_CONFLICT", {
            fixture: `灯具 #${incomingRanges[i].fixture.id}（${incomingRanges[i].fixture.fixture_code}）`,
            range: formatDmxRange(incomingRanges[i].range),
            other: `灯具 #${incomingRanges[j].fixture.id}（${incomingRanges[j].fixture.fixture_code}）`,
            otherRange: formatDmxRange(incomingRanges[j].range)
          })
        );
      }
    }
  }

  const localRanges = localFixtures
    .filter((local) => !fixtureIds.has(local.id))
    .map((fixture) => ({ fixture, range: parseDmxRange(fixture) }))
    .filter((item): item is { fixture: Fixture; range: NonNullable<ReturnType<typeof parseDmxRange>> } => item.range !== null);

  for (const incoming of incomingRanges) {
    const hit = localRanges.find((local) => dmxRangesOverlap(incoming.range, local.range));
    if (hit) {
      return conflict(
        "DMX_ADDRESS_CONFLICT",
        renderErrorMessage("TRANSFER_DMX_CONFLICT", {
          fixture: `导入灯具 #${incoming.fixture.id}（${incoming.fixture.fixture_code}）`,
          range: formatDmxRange(incoming.range),
          other: `本机灯具 #${hit.fixture.id}（${hit.fixture.fixture_code}）`,
          otherRange: formatDmxRange(hit.range)
        })
      );
    }
  }

  return null;
}
