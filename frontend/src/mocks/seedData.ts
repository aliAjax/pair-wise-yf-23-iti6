export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-A01",
      "fixture_type": "SPOT",
      "position_x": "120",
      "position_y": "80",
      "dmx_address": "1",
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 2,
      "fixture_code": "WASH-B02",
      "fixture_type": "WASH",
      "position_x": "300",
      "position_y": "80",
      "dmx_address": "17",
      "channel_count": 8,
      "color_mode": "RGB"
    },
    {
      "id": 3,
      "fixture_code": "BEAM-C03",
      "fixture_type": "BEAM",
      "position_x": "480",
      "position_y": "80",
      "dmx_address": "33",
      "channel_count": 6,
      "color_mode": "MOVING_HEAD"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖场",
      "fixture_states": "[{\"fixture_id\":1,\"intensity\":60}]",
      "fade_in_ms": "1500",
      "hold_ms": "4000",
      "priority": "10",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "主唱追光",
      "fixture_states": "[{\"fixture_id\":3,\"intensity\":100}]",
      "fade_in_ms": "500",
      "hold_ms": "6000",
      "priority": "20",
      "scene_status": "DISABLED"
    },
    {
      "id": 3,
      "name": "旧版谢幕",
      "fixture_states": "[]",
      "fade_in_ms": "2000",
      "hold_ms": "3000",
      "priority": "5",
      "scene_status": "DRAFT"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "5500",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "6000",
      "duration_ms": "6500",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "13000",
      "duration_ms": "5000",
      "layer": "2",
      "locked": "true"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "巡演·北京站",
      "venue_name": "北京工人体育馆",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "title": "巡演·上海站",
      "venue_name": "上海梅赛德斯奔驰文化中心",
      "fixture_ids": [
        1,
        2,
        3
      ],
      "track_ids": [
        1,
        2,
        3
      ],
      "updated_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "title": "体育馆彩排",
      "venue_name": "市体育中心",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1
      ],
      "updated_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
