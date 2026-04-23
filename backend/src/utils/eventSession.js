const EventMeta = require("../models/eventMeta.model.js");

const ACTIVE_EVENT_KEY = "activeEvent";

let cachedActiveSince = null;
let cacheLoadedAtMs = 0;
const CACHE_TTL_MS = 5_000;

const ensureActiveEventDoc = async () => {
  let meta = await EventMeta.findOne({ key: ACTIVE_EVENT_KEY });
  if (!meta) {
    meta = await EventMeta.create({
      key: ACTIVE_EVENT_KEY,
      activeSince: new Date(0),
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
  cacheLoadedAtMs = now;
  return cachedActiveSince;
};

const setActiveEventStartAt = async (dateValue) => {
  const nextDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const meta = await EventMeta.findOneAndUpdate(
    { key: ACTIVE_EVENT_KEY },
    { $set: { activeSince: nextDate } },
    { upsert: true, new: true },
  );

  cachedActiveSince = meta.activeSince;
  cacheLoadedAtMs = Date.now();
  return cachedActiveSince;
};

const buildActiveEventStudentFilter = (activeSince) => {
  const sessionStart = activeSince instanceof Date ? activeSince : new Date(0);
  const sessionKey = sessionStart.toISOString();

  // Initial/default session: include legacy/seeded students that haven't been
  // stamped with a sessionKey yet.
  if (sessionStart.getTime() === 0) {
    return {
      $or: [
        { "event.sessionKey": sessionKey },
        { "event.sessionKey": { $exists: false } },
        { "event.sessionKey": null },
      ],
    };
  }

  return { "event.sessionKey": sessionKey };
};

const buildActiveEventLogFilter = (activeSince) => ({
  createdAt: { $gte: activeSince || new Date(0) },
});

module.exports = {
  getActiveEventStartAt,
  setActiveEventStartAt,
  buildActiveEventStudentFilter,
  buildActiveEventLogFilter,
};
