const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const ticketmasterService = require("../src/services/ticketmasterService");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function signTicket(ticketId) {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(ticketId)
    .digest("hex");
}

async function upsertUser({ name, email, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, password: hashedPassword, role },
  });
}

async function createEventIfMissing(organizerId, data) {
  const existing = await prisma.event.findFirst({
    where: { externalId: data.externalId },
  });
  if (existing) return existing;

  return prisma.event.create({
    data: {
      title: data.title,
      source: "TICKETMASTER",
      externalId: data.externalId,
      date: data.date
        ? new Date(data.date)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: data.location,
      capacity: 100,
      price: 120.0,
      organizerId,
    },
  });
}

async function seedRealTicketmasterEvents(organizerId) {
  if (!process.env.TICKETMASTER_API_KEY) {
    console.log(
      "TICKETMASTER_API_KEY não configurada — pulando eventos reais da Ticketmaster.",
    );
    return [];
  }

  const keywords = [
    "sertanejo",
    "pop",
    "rock",
    "eletronica",
    "mpb",
    "funk",
    "pagode",
    "samba",
    "hip hop",
    "reggae",
    "jazz",
    "gospel",
    "stand up comedy",
    "teatro",
    "infantil",
    "festival",
  ];
  const created = [];

  for (const keyword of keywords) {
    try {
      const results = await ticketmasterService.search(keyword);
      const picks = results.slice(0, 5);

      for (const pick of picks) {
        const event = await createEventIfMissing(organizerId, pick);
        created.push(event);
      }
    } catch (err) {
      console.log(
        `Não foi possível buscar "${keyword}" na Ticketmaster: ${err.message}`,
      );
    }
  }

  return created;
}

async function main() {
  console.log("Criando usuários de teste...");

  const organizer = await upsertUser({
    name: "Organizador Teste",
    email: "organizador@teste.com",
    password: "123456",
    role: "ORGANIZER",
  });

  const customer1 = await upsertUser({
    name: "Cliente Um",
    email: "cliente1@teste.com",
    password: "123456",
    role: "CUSTOMER",
  });

  await upsertUser({
    name: "Cliente Dois",
    email: "cliente2@teste.com",
    password: "123456",
    role: "CUSTOMER",
  });

  await upsertUser({
    name: "Portaria Teste",
    email: "portaria@teste.com",
    password: "123456",
    role: "STAFF",
  });

  console.log("Criando evento de teste base...");

  const baseEvent = await createEventIfMissing(organizer.id, {
    title: "Show de Lançamento EliteTicket",
    externalId: "seed-evento-01",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Arena Central, São Paulo",
  });

  console.log("Buscando shows reais na Ticketmaster...");
  const realEvents = await seedRealTicketmasterEvents(organizer.id);
  console.log(
    `${realEvents.length} evento(s) real(is) da Ticketmaster criado(s).`,
  );

  console.log("Criando ingresso de exemplo para o Cliente Um...");

  const existingReservation = await prisma.reservation.findFirst({
    where: { eventId: baseEvent.id, customerId: customer1.id },
  });

  if (!existingReservation) {
    const reservation = await prisma.reservation.create({
      data: {
        eventId: baseEvent.id,
        customerId: customer1.id,
        quantity: 1,
        status: "PAID",
      },
    });

    const ticket = await prisma.ticket.create({
      data: { reservationId: reservation.id, qrCode: "PENDING" },
    });

    const qrCode = `${ticket.id}.${signTicket(ticket.id)}`;

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { qrCode },
    });
  }

  console.log("Seed concluído com sucesso!");
  console.log("---");
  console.log("Organizador: organizador@teste.com / 123456");
  console.log("Cliente 1:   cliente1@teste.com / 123456 (já tem 1 ingresso)");
  console.log("Cliente 2:   cliente2@teste.com / 123456");
  console.log("Portaria:    portaria@teste.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
