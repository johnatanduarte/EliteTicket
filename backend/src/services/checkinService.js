const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function verifySignature(ticketId, signature) {
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(ticketId).digest('hex');
  return expected === signature;
}

async function validate({ qrCode, eventId }) {
  const [ticketId, signature] = (qrCode || '').split('.');

  if (!ticketId || !signature || !verifySignature(ticketId, signature)) {
    return { result: 'INVALID', message: 'Código inválido ou adulterado' };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { reservation: { include: { event: true, customer: true } } },
  });

  if (!ticket) {
    return { result: 'INVALID', message: 'Ingresso não encontrado' };
  }

  if (ticket.reservation.eventId !== eventId) {
    return { result: 'WRONG_EVENT', message: 'Este ingresso é de outro evento', event: ticket.reservation.event.title };
  }

  if (ticket.status === 'USED') {
    return { result: 'USED', message: `Já utilizado em ${ticket.usedAt.toLocaleString('pt-BR')}` };
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'USED', usedAt: new Date() },
  });

  return {
    result: 'VALID',
    message: 'Ingresso válido',
    customerName: ticket.reservation.customer.name,
    quantity: ticket.reservation.quantity,
    usedAt: updatedTicket.usedAt,
  };
}

module.exports = { validate };