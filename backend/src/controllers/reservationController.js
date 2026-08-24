const reservationService = require("../services/reservationService");

async function create(req, res) {
  try {
    const reservation = await reservationService.create({
      customerId: req.user.id,
      eventId: req.body.eventId,
      quantity: Number(req.body.quantity),
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function pay(req, res) {
  try {
    const result = await reservationService.pay({
      reservationId: req.params.id,
      customerId: req.user.id,
      approve: req.body.approve,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listMine(req, res) {
  const reservations = await reservationService.listMine(req.user.id);
  res.status(200).json(reservations);
}

async function getShared(req, res) {
  try {
    const ticket = await reservationService.getSharedTicket(
      req.params.ticketId,
    );
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

module.exports = { create, pay, listMine, getShared };
