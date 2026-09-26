import assert from "node:assert";
import { buildProjectExport } from "../src/services/projectExportService";
import { parseTransferContent, validateTransferPayload } from "../src/services/projectValidationService";
import { mergeProjectTransfer } from "../src/services/projectMergeService";
import { createDefaultFixture } from "../src/constructors/FixtureConstructor";
import { createDefaultCueScene } from "../src/constructors/CueSceneConstructor";
import { createDefaultTimelineTrack } from "../src/constructors/TimelineTrackConstructor";
import { createDefaultShowProject } from "../src/constructors/ShowProjectConstructor";
import type { Fixture } from "../src/types/Fixture";

const fixtures = [
  createDefaultFixture({ id: 1, fixture_code: "P1", dmx_address: "1", channel_count: 4 }),
  createDefaultFixture({ id: 2, fixture_code: "P2", dmx_address: "17", channel_count: 8 }),
  createDefaultFixture({ id: 3, fixture_code: "P3", dmx_address: "33", channel_count: 6 })
];
const scenes = [
  createDefaultCueScene({ id: 1, scene_status: "READY" }),
  createDefaultCueScene({ id: 9, scene_status: "ARCHIVED", name: "归档场景" })
];
const tracks = [
  createDefaultTimelineTrack({ id: 1, cue_scene_id: 1 }),
  createDefaultTimelineTrack({ id: 9, cue_scene_id: 9 })
];
const project = createDefaultShowProject({ id: 1, fixture_ids: [1, 2], track_ids: [1, 9], updated_at: "2026-09-01T00:00:00Z" });

// 1) 导出只含方案用到的数据；已归档场景及其轨道不打包
const exported = buildProjectExport({ project, fixtures, cueScenes: scenes, tracks });
assert.deepStrictEqual(exported.payload.fixtures.map((f) => f.id), [1, 2]);
assert.deepStrictEqual(exported.payload.cue_scenes.map((s) => s.id), [1]);
assert.deepStrictEqual(exported.payload.tracks.map((t) => t.id), [1]);
assert.strictEqual(exported.payload.version, 1);
assert.strictEqual(exported.payload.format, "stage-light/project-transfer");

// 2) 版本不对 -> 第一条冲突为 UNSUPPORTED_VERSION
const badVersion = JSON.stringify({ ...exported.payload, version: 99 });
const parsedBad = parseTransferContent(badVersion);
assert.ok(parsedBad.ok);
if (parsedBad.ok) {
  const conflict = validateTransferPayload({ payload: parsedBad.payload, localFixtures: fixtures });
  assert.strictEqual(conflict?.kind, "UNSUPPORTED_VERSION");
}

// 3) 垃圾内容 -> MALFORMED_PAYLOAD
assert.strictEqual(parseTransferContent("not json").ok, false);

// 4) 缺少引用的灯具 -> MISSING_FIXTURE
const missingFixture = JSON.parse(JSON.stringify(exported.payload));
missingFixture.fixtures = missingFixture.fixtures.filter((f: Fixture) => f.id !== 2);
const c4 = validateTransferPayload({ payload: missingFixture, localFixtures: fixtures });
assert.strictEqual(c4?.kind, "MISSING_FIXTURE");

// 5) 轨道引用的场景缺失 -> MISSING_SCENE
const missingScene = JSON.parse(JSON.stringify(exported.payload));
missingScene.cue_scenes = [];
assert.strictEqual(validateTransferPayload({ payload: missingScene, localFixtures: fixtures })?.kind, "MISSING_SCENE");

// 6) 导入内容内部两灯地址段重叠 -> DMX_ADDRESS_CONFLICT
const internalOverlap = JSON.parse(JSON.stringify(exported.payload));
internalOverlap.fixtures[1].dmx_address = "3"; // 1-4 与 3-10 重叠
assert.strictEqual(validateTransferPayload({ payload: internalOverlap, localFixtures: [fixtures[2]!] })?.kind, "DMX_ADDRESS_CONFLICT");

// 7) 与本机灯具地址段重叠 -> DMX_ADDRESS_CONFLICT
const localOverlap = JSON.parse(JSON.stringify(exported.payload));
const localOnly: Fixture[] = [createDefaultFixture({ id: 99, fixture_code: "LOCAL", dmx_address: "3", channel_count: 2 })];
assert.strictEqual(validateTransferPayload({ payload: localOverlap, localFixtures: localOnly })?.kind, "DMX_ADDRESS_CONFLICT");

// 8) 校验失败时不产生合并结果（调用方负责保持当前数据，service 不写库）
assert.ok(validateTransferPayload({ payload: internalOverlap, localFixtures: [] }));

// 9) 合并：同编号覆盖、新增追加；归档场景不参与合并；旧 updated_at 不覆盖方案
const incoming = exported.payload;
const localFixtures = [
  createDefaultFixture({ id: 1, fixture_code: "OLD-LOCAL", dmx_address: "1", channel_count: 4 }),
  createDefaultFixture({ id: 99, fixture_code: "KEEP", dmx_address: "80", channel_count: 1 })
];
const localScenes = [createDefaultCueScene({ id: 1, name: "本机旧场景" })];
const localTracks = [createDefaultTimelineTrack({ id: 1, layer: "9" })];
const localProjects = [createDefaultShowProject({ id: 1, title: "本机新方案", updated_at: "2026-09-20T00:00:00Z" })];

// 先构造一个带归档场景的合法 payload（通过合并服务自身过滤验证）
const withArchived = JSON.parse(JSON.stringify(incoming));
withArchived.cue_scenes.push(createDefaultCueScene({ id: 77, scene_status: "ARCHIVED" }));
withArchived.tracks.push(createDefaultTimelineTrack({ id: 77, cue_scene_id: 77 }));
withArchived.project.track_ids.push(77);
// 该 payload 自身校验：场景齐全，无地址冲突
assert.strictEqual(validateTransferPayload({ payload: withArchived, localFixtures: localFixtures }), null);

const merged = mergeProjectTransfer({
  payload: withArchived,
  fixtures: localFixtures,
  cueScenes: localScenes,
  tracks: localTracks,
  projects: localProjects
});
assert.strictEqual(merged.fixtures.find((f) => f.id === 1)?.fixture_code, "P1", "同编号灯具以导入为准");
assert.ok(merged.fixtures.some((f) => f.id === 2), "新灯具追加");
assert.ok(merged.fixtures.some((f) => f.id === 99), "本机其他灯具保留");
assert.ok(!merged.cueScenes.some((s) => s.id === 77), "归档场景不参与合并");
assert.ok(!merged.tracks.some((t) => t.id === 77), "归档场景的轨道不参与合并");
assert.strictEqual(merged.report.cueScenes.skippedArchived, 1);
assert.strictEqual(merged.projects.find((p) => p.id === 1)?.title, "本机新方案", "旧 updated_at 不覆盖本机方案");
assert.strictEqual(merged.report.project, "kept_local");

// 10) 导入方案更新 -> 覆盖
const newerProject = JSON.parse(JSON.stringify(withArchived));
newerProject.project.updated_at = "2026-10-01T00:00:00Z";
const merged2 = mergeProjectTransfer({
  payload: newerProject,
  fixtures: localFixtures,
  cueScenes: localScenes,
  tracks: localTracks,
  projects: localProjects
});
assert.strictEqual(merged2.report.project, "updated");

console.log("all transfer service assertions passed");
