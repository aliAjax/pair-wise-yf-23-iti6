export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": "120",
      "position_y": "40",
      "dmx_address": "1",
      "channel_count": 8,
      "color_mode": "RGB",
      "updated_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "240",
      "position_y": "40",
      "dmx_address": "9",
      "channel_count": 16,
      "color_mode": "MOVING_HEAD",
      "updated_at": "2026-06-11T09:30:00Z"
    },
    {
      "id": 3,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": "360",
      "position_y": "40",
      "dmx_address": "25",
      "channel_count": 12,
      "color_mode": "RGBW",
      "updated_at": "2026-06-11T10:00:00Z"
    },
    {
      "id": 4,
      "fixture_code": "BEAM-01",
      "fixture_type": "BEAM",
      "position_x": "480",
      "position_y": "40",
      "dmx_address": "37",
      "channel_count": 16,
      "color_mode": "MOVING_HEAD",
      "updated_at": "2026-06-11T10:30:00Z"
    },
    {
      "id": 5,
      "fixture_code": "STROBE-01",
      "fixture_type": "STROBE",
      "position_x": "180",
      "position_y": "160",
      "dmx_address": "53",
      "channel_count": 4,
      "color_mode": "DIMMER_ONLY",
      "updated_at": "2026-06-11T11:00:00Z"
    },
    {
      "id": 6,
      "fixture_code": "PAR-02",
      "fixture_type": "PAR",
      "position_x": "420",
      "position_y": "160",
      "dmx_address": "57",
      "channel_count": 8,
      "color_mode": "RGB",
      "updated_at": "2026-06-11T11:30:00Z"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖色",
      "fixture_states": "{\"1\":[255,180,80],\"6\":[255,180,80]}",
      "fade_in_ms": "800",
      "hold_ms": "4000",
      "priority": "10",
      "scene_status": "READY",
      "updated_at": "2026-06-11T12:00:00Z"
    },
    {
      "id": 2,
      "name": "副歌追光",
      "fixture_states": "{\"2\":[255,255,255],\"4\":[200,220,255]}",
      "fade_in_ms": "500",
      "hold_ms": "5200",
      "priority": "20",
      "scene_status": "READY",
      "updated_at": "2026-06-11T12:30:00Z"
    },
    {
      "id": 3,
      "name": "全场频闪",
      "fixture_states": "{\"5\":[255]}",
      "fade_in_ms": "0",
      "hold_ms": "2000",
      "priority": "30",
      "scene_status": "DRAFT",
      "updated_at": "2026-06-11T13:00:00Z"
    },
    {
      "id": 4,
      "name": "旧版谢幕",
      "fixture_states": "{\"3\":[120,80,200]}",
      "fade_in_ms": "1200",
      "hold_ms": "3000",
      "priority": "5",
      "scene_status": "ARCHIVED",
      "updated_at": "2026-05-20T09:00:00Z"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "4800",
      "layer": "1",
      "locked": "false",
      "updated_at": "2026-06-11T14:00:00Z"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "4800",
      "duration_ms": "5200",
      "layer": "1",
      "locked": "false",
      "updated_at": "2026-06-11T14:30:00Z"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "10000",
      "duration_ms": "2000",
      "layer": "2",
      "locked": "true",
      "updated_at": "2026-06-11T15:00:00Z"
    },
    {
      "id": 4,
      "cue_scene_id": 4,
      "start_ms": "12000",
      "duration_ms": "3000",
      "layer": "2",
      "locked": "false",
      "updated_at": "2026-06-11T15:30:00Z"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "夏夜巡演 A 站",
      "venue_name": "滨江 Livehouse",
      "fixture_ids": [1, 2, 3, 4, 5, 6],
      "track_ids": [1, 2, 3],
      "updated_at": "2026-06-11T16:00:00Z"
    },
    {
      "id": 2,
      "title": "夏夜巡演 B 站",
      "venue_name": "老城剧院",
      "fixture_ids": [1, 2, 5],
      "track_ids": [1, 2],
      "updated_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "title": "音乐节主舞台",
      "venue_name": "河西公园",
      "fixture_ids": [3, 4, 6],
      "track_ids": [3, 4],
      "updated_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
