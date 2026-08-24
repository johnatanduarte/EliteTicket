const checkinService = require("../services/checkinService");

async function validate(req, res) {
  try {
    const result = await checkinService.validate({
      qrCode: req.body.qrCode,
      eventId: req.body.eventId,
    });
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ result: "ERROR", message: "Erro ao validar ingresso" });
  }
}

module.exports = { validate };
