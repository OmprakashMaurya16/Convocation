const Student = require("../models/student.model.js");
const SeatOverride = require("../models/seatOverride.model.js");
const {
  getActiveEventStartAt,
  buildActiveEventStudentFilter,
} = require("./eventSession.js");
const DepartmentConfig = require("../models/departmentConfig.model.js");

const FRONT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const SIDE_ROWS = ["J", "K", "L", "M", "N", "O"];
const BACK_ROWS = ["P", "Q", "R"];

const buildSeatIds = (row, count, startNumber = 1) =>
  Array.from({ length: count }, (_, idx) => `${row}${startNumber + idx}`);

const ALL_SEAT_IDS = [
  ...FRONT_ROWS.flatMap((row) => buildSeatIds(row, 17, 1)),
  ...SIDE_ROWS.flatMap((row) => buildSeatIds(row, 5, 1)),
  ...SIDE_ROWS.flatMap((row) => buildSeatIds(row, 5, 13)),
  ...BACK_ROWS.flatMap((row) => buildSeatIds(row, 17, 1)),
];

const parseSeatId = (seatId) => {
  const match = String(seatId || "")
    .trim()
    .match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return { section: match[1], number: match[2] };
};

const getOccupiedSeatIdSet = async () => {
  const activeSince = await getActiveEventStartAt();
  const activeFilter = buildActiveEventStudentFilter(activeSince);
  const seatedStudents = await Student.find({
    ...activeFilter,
    "seat.section": { $exists: true, $ne: null, $ne: "" },
    "seat.number": { $exists: true, $ne: null, $ne: "" },
  }).select("seat");

  const occupied = new Set();
  for (const student of seatedStudents) {
    const section = String(student.seat?.section || "").trim();
    const number = String(student.seat?.number || "").trim();
    if (section && number) {
      occupied.add(`${section}${number}`);
    }
  }

  return occupied;
};

const getBlockedSeatIdSet = async () => {
  const overrides = await SeatOverride.find({
    status: { $in: ["reserved", "manual"] },
  }).select("seatId status");

  const blocked = new Set();
  for (const override of overrides) {
    const seatId = String(override.seatId || "").trim();
    if (seatId) blocked.add(seatId);
  }

  return blocked;
};

const findNextAvailableSeat = async (department) => {
  const [occupied, blocked, deptConfigs] = await Promise.all([
    getOccupiedSeatIdSet(),
    getBlockedSeatIdSet(),
    DepartmentConfig.find()
  ]);

  let availableSeats = ALL_SEAT_IDS;

  if (department) {
    const config = deptConfigs.find(c => c.department === department);
    if (config && config.startSeat && config.endSeat) {
      const startIndex = ALL_SEAT_IDS.indexOf(config.startSeat);
      const endIndex = ALL_SEAT_IDS.indexOf(config.endSeat);
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        availableSeats = ALL_SEAT_IDS.slice(startIndex, endIndex + 1);
      }
    }
  }

  for (const seatId of availableSeats) {
    if (!occupied.has(seatId) && !blocked.has(seatId)) {
      return parseSeatId(seatId);
    }
  }

  return null;
};

module.exports = {
  ALL_SEAT_IDS,
  parseSeatId,
  findNextAvailableSeat,
};
