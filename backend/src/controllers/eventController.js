const eventService = require("../services/eventService");

async function create(req, res) {
  try {
    const event = await eventService.create({
      ...req.body,
      organizerId: req.user.id,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listAll(req, res) {
  const result = await eventService.listAll({
    search: req.query.search || "",
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 6,
  });
  res.status(200).json(result);
}

async function getById(req, res) {
  try {
    const event = await eventService.getById(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const event = await eventService.update(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    await eventService.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listMine(req, res) {
  const events = await eventService.listMine(req.user.id);
  res.status(200).json(events);
}

module.exports = { create, listAll, listMine, getById, update, remove };
