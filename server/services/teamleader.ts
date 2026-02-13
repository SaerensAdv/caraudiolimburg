import { db } from "../db";
import { teamleaderTokens } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const OAUTH2_AUTHORIZE_URL = "https://focus.teamleader.eu/oauth2/authorize";
const OAUTH2_TOKEN_URL = "https://focus.teamleader.eu/oauth2/access_token";
const API_BASE_URL = "https://api.focus.teamleader.eu";

function getClientId(): string | undefined {
  return process.env.TEAMLEADER_CLIENT_ID;
}

function getClientSecret(): string | undefined {
  return process.env.TEAMLEADER_CLIENT_SECRET;
}

function getRedirectUri(): string | undefined {
  return process.env.TEAMLEADER_REDIRECT_URI;
}

export function isConfigured(): boolean {
  return !!(getClientId() && getClientSecret());
}

export function getAuthorizationUrl(): { url: string; state: string } {
  const clientId = getClientId();
  const redirectUri = getRedirectUri();
  if (!clientId || !redirectUri) {
    throw new Error("Teamleader client ID and redirect URI must be configured");
  }
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  const url = `${OAUTH2_AUTHORIZE_URL}?${params.toString()}`;
  return { url, state };
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const redirectUri = getRedirectUri();
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Teamleader OAuth2 credentials not configured");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(OAUTH2_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  const existing = await db.select().from(teamleaderTokens).limit(1);
  if (existing.length > 0) {
    await db
      .update(teamleaderTokens)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(teamleaderTokens.id, existing[0].id));
  } else {
    await db.insert(teamleaderTokens).values({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    });
  }
}

async function getStoredToken() {
  const [token] = await db.select().from(teamleaderTokens).limit(1);
  return token || null;
}

async function refreshAccessToken(): Promise<string | null> {
  const token = await getStoredToken();
  if (!token) return null;

  const clientId = getClientId();
  const clientSecret = getClientSecret();
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  });

  try {
    const response = await fetch(OAUTH2_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Teamleader token refresh failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await db
      .update(teamleaderTokens)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(teamleaderTokens.id, token.id));

    return data.access_token;
  } catch (error) {
    console.error("Teamleader token refresh error:", error);
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const token = await getStoredToken();
  if (!token) return null;

  if (new Date() >= new Date(token.expiresAt.getTime() - 60000)) {
    return await refreshAccessToken();
  }

  return token.accessToken;
}

async function apiCall(endpoint: string, payload: any): Promise<any> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    console.warn("Teamleader: No valid access token available");
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Teamleader API ${endpoint} failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

export async function isConnected(): Promise<boolean> {
  const token = await getStoredToken();
  return !!token;
}

export async function getConnectionStatus(): Promise<{ connected: boolean; expiresAt?: string }> {
  const token = await getStoredToken();
  if (!token) return { connected: false };
  return {
    connected: true,
    expiresAt: token.expiresAt.toISOString(),
  };
}

export async function disconnect(): Promise<void> {
  await db.delete(teamleaderTokens);
}

interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
}

export async function createContact(data: CreateContactData): Promise<string | null> {
  if (!isConfigured()) {
    console.warn("Teamleader: Not configured, skipping contact creation");
    return null;
  }

  try {
    const payload: any = {
      first_name: data.firstName,
      last_name: data.lastName,
      emails: [{ type: "primary", email: data.email }],
      tags: ["website-lead"],
    };

    if (data.phone) {
      payload.telephones = [{ type: "mobile", number: data.phone }];
    }

    payload.addresses = [
      {
        type: "primary",
        address: {
          line_1: null,
          postal_code: null,
          city: null,
          country: data.country || "NL",
        },
      },
    ];

    const result = await apiCall("contacts.add", payload);
    if (result?.data?.id) {
      return result.data.id;
    }
    return null;
  } catch (error) {
    console.error("Teamleader createContact error:", error);
    return null;
  }
}

interface CreateDealData {
  contactId: string;
  title: string;
  summary?: string;
  customFields?: {
    merk?: string;
    kenteken?: string;
    model?: string;
    vin?: string;
    bouwjaar?: string;
  };
}

export async function createDeal(data: CreateDealData): Promise<string | null> {
  if (!isConfigured()) {
    console.warn("Teamleader: Not configured, skipping deal creation");
    return null;
  }

  try {
    const payload: any = {
      lead: {
        customer: { type: "contact", id: data.contactId },
      },
      title: data.title,
      summary: data.summary || "",
    };

    if (data.customFields) {
      const customFieldsList: { id: string; value: string }[] = [];

      const cfMapping: Record<string, string | undefined> = {
        merk: process.env.TEAMLEADER_CF_MERK,
        kenteken: process.env.TEAMLEADER_CF_KENTEKEN,
        model: process.env.TEAMLEADER_CF_MODEL,
        vin: process.env.TEAMLEADER_CF_VIN,
        bouwjaar: process.env.TEAMLEADER_CF_BOUWJAAR,
      };

      for (const [key, envId] of Object.entries(cfMapping)) {
        const value = data.customFields[key as keyof typeof data.customFields];
        if (envId && value) {
          customFieldsList.push({ id: envId, value });
        }
      }

      if (customFieldsList.length > 0) {
        payload.custom_fields = customFieldsList;
      }
    }

    const result = await apiCall("deals.create", payload);
    if (result?.data?.id) {
      return result.data.id;
    }
    return null;
  } catch (error) {
    console.error("Teamleader createDeal error:", error);
    return null;
  }
}
