const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const ticketmasterService = require("./ticketmasterService");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function attachImage(event) {
  if (event.source !== "TICKETMASTER" || !process.env.TICKETMASTER_API_KEY) {
    return { ...event, image: null };
  }
  const image = await ticketmasterService.getImage(event.externalId);
  return { ...event, image };
}

async function create({
  organizerId,
  title,
  source,
  externalId,
  date,
  location,
  capacity,
  price,
}) {
  return prisma.event.create({
    data: {
      organizerId,
      title,
      source,
      externalId,
      date: new Date(date),
      location,
      capacity,
      price,
    },
  });
}

async function listAll({ search = "", page = 1, pageSize = 6 } = {}) {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  const eventsWithImages = await Promise.all(events.map(attachImage));

  return {
    events: eventsWithImages,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function getById(id) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error("Evento não encontrado");
  return attachImage(event);
}

async function listMine(organizerId) {
  return prisma.event.findMany({
    where: { organizerId },
    orderBy: { date: "asc" },
  });
}

async function update(id, organizerId, data) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error("Evento não encontrado");
  if (event.organizerId !== organizerId)
    throw new Error("Você não tem permissão para editar este evento");

  const payload = {
    ...data,
    ...(data.date && { date: new Date(data.date) }),
  };

  return prisma.event.update({ where: { id }, data: payload });
}

async function remove(id, organizerId) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error("Evento não encontrado");
  if (event.organizerId !== organizerId)
    throw new Error("Você não tem permissão para excluir este evento");

  return prisma.event.delete({ where: { id } });
}

module.exports = { create, listAll, listMine, getById, update, remove };
