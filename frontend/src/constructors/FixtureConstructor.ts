import type { Fixture } from "../types/Fixture";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 1 as never,
  fixture_code: "PAR-01" as never,
  fixture_type: "PAR" as never,
  position_x: "120" as never,
  position_y: "40" as never,
  dmx_address: "1" as never,
  channel_count: 8 as never,
  color_mode: "RGB" as never,
  updated_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
