const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const catalogRoutes = require("./routes/catalogRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/reservations", reservationRoutes);
app.use("/checkin", checkinRoutes);
app.use("/catalog", catalogRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "EliteTicket API" });
});

module.exports = app;
