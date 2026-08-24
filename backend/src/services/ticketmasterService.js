const TICKETMASTER_BASE_URL = "https://app.ticketmaster.com/discovery/v2";

const imageCache = new Map();

async function search(keyword) {
  const url = new URL(`${TICKETMASTER_BASE_URL}/events.json`);
  url.searchParams.set("apikey", process.env.TICKETMASTER_API_KEY);
  url.searchParams.set("countryCode", "BR");
  url.searchParams.set("size", "20");
  if (keyword) url.searchParams.set("keyword", keyword.trim().toLowerCase());

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao consultar a Ticketmaster");
  }

  const data = await response.json();
  const events = data._embedded?.events || [];

  return events.map((event) => {
    const image = extractImage(event);
    imageCache.set(event.id, image);

    return {
      externalId: event.id,
      title: event.name,
      date: event.dates?.start?.dateTime || null,
      location: event._embedded?.venues?.[0]?.name || "Local a definir",
      image,
    };
  });
}

async function getImage(externalId) {
  if (imageCache.has(externalId)) {
    return imageCache.get(externalId);
  }

  try {
    const url = new URL(`${TICKETMASTER_BASE_URL}/events/${externalId}.json`);
    url.searchParams.set("apikey", process.env.TICKETMASTER_API_KEY);

    const response = await fetch(url);
    if (!response.ok) return null;

    const event = await response.json();
    const image = extractImage(event);
    imageCache.set(externalId, image);
    return image;
  } catch {
    return null;
  }
}

function extractImage(event) {
  return (
    event.images?.find((img) => img.ratio === "16_9" && img.width > 500)?.url ||
    event.images?.[0]?.url ||
    null
  );
}

module.exports = { search, getImage };
