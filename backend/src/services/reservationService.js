const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function signTicket(ticketId) {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(ticketId)
    .digest("hex");
}

async function create({ customerId, eventId, quantity }) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Evento não encontrado");

    const aggregate = await tx.reservation.aggregate({
      _sum: { quantity: true },
      where: { eventId, status: { in: ["PENDING", "PAID"] } },
    });
    const alreadyReserved = aggregate._sum.quantity || 0;

    if (alreadyReserved + quantity > event.capacity) {
      throw new Error(
        "Não há lugares suficientes disponíveis para este evento",
      );
    }

    return tx.reservation.create({
      data: { eventId, customerId, quantity, status: "PENDING" },
      include: { event: true },
    });
  });
}

async function pay({ reservationId, customerId, approve }) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) throw new Error("Reserva não encontrada");
  if (reservation.customerId !== customerId)
    throw new Error("Esta reserva não pertence a você");
  if (reservation.status !== "PENDING")
    throw new Error("Esta reserva já foi processada");

  if (!approve) {
    return prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });
  }

  return prisma.$transaction(async (tx) => {
    const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "PAID" },
    });

    const ticket = await tx.ticket.create({
      data: {
        reservationId,
        qrCode: "PENDING",
      },
    });

    const qrCode = `${ticket.id}.${signTicket(ticket.id)}`;

    return tx.ticket.update({
      where: { id: ticket.id },
      data: { qrCode },
      include: { reservation: { include: { event: true } } },
    });
  });
}

async function listMine(customerId) {
  return prisma.reservation.findMany({
    where: { customerId },
    include: { event: true, ticket: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getSharedTicket(ticketId) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { reservation: { include: { event: true } } },
  });

  if (!ticket) throw new Error("Ingresso não encontrado");

  return {
    qrCode: ticket.qrCode,
    status: ticket.status,
    event: {
      title: ticket.reservation.event.title,
      date: ticket.reservation.event.date,
      location: ticket.reservation.event.location,
    },
    quantity: ticket.reservation.quantity,
  };
}

module.exports = { create, pay, listMine, getSharedTicket };
