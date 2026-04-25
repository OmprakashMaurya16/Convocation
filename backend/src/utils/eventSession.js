const EventMeta = require("../models/eventMeta.model.js");

const ACTIVE_EVENT_KEY = "activeEvent";

let cachedActiveSince = null;
let cachedLabel = "";
let cacheLoadedAtMs = 0;
const CACHE_TTL_MS = 5_000;

const ensureActiveEventDoc = async () => {
  let meta = await EventMeta.findOne({ key: ACTIVE_EVENT_KEY });
  if (!meta) {
    meta = await EventMeta.create({
      key: ACTIVE_EVENT_KEY,
      activeSince: new Date(0),
      label: "",
    });
  }
  return meta;
};

const getActiveEventStartAt = async () => {
  const now = Date.now();
  if (cachedActiveSince && now - cacheLoadedAtMs < CACHE_TTL_MS) {
    return cachedActiveSince;
  }

  const meta = await ensureActiveEventDoc();
  cachedActiveSince = meta.activeSince || new Date(0);
  cachedLabel = String(meta.label || "").trim();
  cacheLoadedAtMs = now;
  return cachedActiveSince;
};

const getActiveEventLabel = async () => {
  await getActiveEventStartAt();
  return cachedLabel;
};

const setActiveEventSession = async ({ activeSince, label } = {}) => {
  const nextDate =
    activeSince instanceof Date
      ? activeSince
      : new Date(activeSince || Date.now());
  const nextLabel = String(label || "").trim();

  const meta = await EventMeta.findOneAndUpdate(
    { key: ACTIVE_EVENT_KEY },
    { $set: { activeSince: nextDate, label: nextLabel } },
    { upsert: true, new: true },
  );

  cachedActiveSince = meta.activeSince;
  cachedLabel = String(meta.label || "").trim();
  cacheLoadedAtMs = Date.now();
  return { activeSince: cachedActiveSince, label: cachedLabel };
};

const setActiveEventStartAt = async (dateValue) => {
  const nextDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const meta = await EventMeta.findOneAndUpdate(
    { key: ACTIVE_EVENT_KEY },
    { $set: { activeSince: nextDate } },
    { upsert: true, new: true },
  );

  cachedActiveSince = meta.activeSince;
  cachedLabel = String(meta.label || "").trim();
  cacheLoadedAtMs = Date.now();
  return cachedActiveSince;
};

const buildActiveEventStudentFilter = (activeSince) => {
  const sessionStart = activeSince instanceof Date ? activeSince : new Date(0);
  const sessionKey = sessionStart.toISOString();

  // Initial/default session: include legacy/seeded students that haven't been
  // stamped with a sessionKey yet, or those with exact match
  if (sessionStart.getTime() === 0) {
    return {
      $or: [
        { "event.sessionKey": sessionKey },
        { "event.sessionKey": { $exists: false } },
        { "event.sessionKey": null },
      ],
    };
  }

  // For active sessions: BOTH conditions must be true:
  // 1. sessionKey matches the current session
  // 2. registeredAt is within or after this session (double-check against DB)
  return {
    $and: [
      { "event.sessionKey": sessionKey },
      {
        "event.registeredAt": {
          $gte: sessionStart, // Only show students registered in or after this session
        },
      },
    ],
  };
};

const buildActiveEventLogFilter = (activeSince) => ({
  createdAt: { $gte: activeSince || new Date(0) },
});

module.exports = {
  getActiveEventStartAt,
  getActiveEventLabel,
  setActiveEventSession,
  setActiveEventStartAt,
  buildActiveEventStudentFilter,
  buildActiveEventLogFilter,
};
