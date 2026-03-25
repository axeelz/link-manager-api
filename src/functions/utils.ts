import { isbot } from "isbot";
import { customAlphabet } from "nanoid";

export function generateCode(): string {
  return customAlphabet("abcdefghijklmnopqrstuvwxyz", 4)();
}

export function getIPLocation(
  ip: string | undefined,
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

// "Chrome/130" + "Mac OS X 10_15_7" = frozen VM fingerprint used by link health checkers
const BANNED_USER_AGENTS = ["Snapchat", "WOW64", "Chrome/130"] as const;

export function isPotentialBot(userAgent: string | undefined): boolean {
  if (userAgent === undefined) return false;
  if (!userAgent) return true;
  if (userAgent.startsWith("Bun/")) return false;

  if (BANNED_USER_AGENTS.some((banned) => userAgent.includes(banned))) {
    return true;
  }

  return isbot(userAgent);
}
