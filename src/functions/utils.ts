import { isbot } from "isbot";
import { customAlphabet } from "nanoid";

export function generateCode(): string {
  return customAlphabet("abcdefghijklmnopqrstuvwxyz", 4)();
}

export function getIPLocation(
  ip: any,
): Promise<{ city: string; regionName: string; country: string } | null> {
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

const BANNED_USER_AGENTS = ["Snapchat"] as const;

export function isPotentialBot(userAgent: string | undefined): boolean {
  if (!userAgent || userAgent.startsWith("Bun/")) {
    return false;
  }

  if (userAgent === "") {
    return true;
  }

  if (BANNED_USER_AGENTS.some((banned) => userAgent.includes(banned))) {
    return true;
  }

  return isbot(userAgent);
}
