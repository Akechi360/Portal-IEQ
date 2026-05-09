import { URL } from "url";

interface RuijieAuthorizeResult {
  allow: boolean;
  redirectUrl: string;
  protocol: "WISPr" | "WiFiDog" | "Unknown";
  reason?: string;
}

export function detectPortalProtocol(query: URLSearchParams): RuijieAuthorizeResult["protocol"] {
  if (query.get("gw_id") || query.get("gw_address")) return "WiFiDog";
  if (query.get("WISPrVersion") || query.get("WISPAccessGatewayAddress")) return "WISPr";
  return "Unknown";
}

export function buildRuijieSuccessRedirect(redirect: string) {
  try {
    return new URL(redirect).toString();
  } catch {
    return redirect;
  }
}

export function buildRuijieDenyRedirect(redirect: string, message = "access_denied") {
  try {
    const url = new URL(redirect);
    url.searchParams.set("error", message);
    return url.toString();
  } catch {
    return `${redirect}${redirect.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`;
  }
}

export async function authorizeWithRuijieGateway(input: {
  redirect: string;
  approved: boolean;
  reason?: string;
  query: URLSearchParams;
}): Promise<RuijieAuthorizeResult> {
  const protocol = detectPortalProtocol(input.query);
  if (input.approved) {
    return {
      allow: true,
      redirectUrl: buildRuijieSuccessRedirect(input.redirect),
      protocol
    };
  }

  return {
    allow: false,
    redirectUrl: buildRuijieDenyRedirect(input.redirect, input.reason ?? "denied"),
    protocol,
    reason: input.reason
  };
}
