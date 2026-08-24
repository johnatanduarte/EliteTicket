const ticketmasterService = require("../services/ticketmasterService");

async function search(req, res) {
  try {
    const results = await ticketmasterService.search(req.query.keyword);
    res.status(200).json(results);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
}

module.exports = { search };
