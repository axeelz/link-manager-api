import { isbot } from "isbot";
import { customAlphabet } from "nanoid";

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function generateCode(): string {
  return customAlphabet("abcdefghijklmnopqrstuvwxyz", 4)();
}

export function getIPLocation(ip: any): Promise<{ city: string; regionName: string; country: string } | null> {
  if (!ip) {
    return Promise.resolve(null);
  }
  return fetch(`http://ip-api.com/json/${ip}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== "success") {
        console.error(data);
        throw new Error("Failed to get location");
      }
      return {
        city: data.city,
        regionName: data.regionName,
        country: data.country,
      };
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}

export function isPotentialBot(userAgent: string | undefined): boolean {
  if (!userAgent || userAgent.startsWith("Bun/")) {
    return false;
  }
  if (userAgent === "") {
    return true;
  }
  return isbot(userAgent);
}
