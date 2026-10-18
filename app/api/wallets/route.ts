import { NextRequest, NextResponse } from "next/server";

const ADMIN_WALLET = "0xEf6fdfe87081da6acC6E4755d095b8C23568577F".toLowerCase();

type WalletRegistryPayload = {
  wallet?: string;
  wallet_address?: string;
  displayName?: string;
  display_name?: string;
  connectedApps?: number;
  connected_app_count?: number;
  rewardPoints?: number;
  reward_points?: number;
  adminWallet?: string;
  targetWallet?: string;
  guardianData?: Record<string, unknown>;
  dailyRecords?: Record<string, unknown>;
  connectedHealthApps?: string[];
  healthPermissions?: Record<string, string[]>;
};

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
};

const supabaseRequest = async (path: string, init: RequestInit = {}) => {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
};

const normalizeWallet = (wallet?: string) => wallet?.trim().toLowerCase() ?? "";
const requireAdmin = (wallet?: string) => normalizeWallet(wallet) === ADMIN_WALLET;

export async function GET(request: NextRequest) {
  const adminWallet = request.nextUrl.searchParams.get("adminWallet") ?? "";
  const wallet = normalizeWallet(request.nextUrl.searchParams.get("wallet") ?? "");

  if (wallet) {
    let response = await supabaseRequest(
      `wallet_profiles?wallet_address=eq.${encodeURIComponent(wallet)}&select=wallet_address,display_name,connected_health_apps,connected_app_count,health_permissions,reward_points,guardian_data,created_at,last_seen_at,reset_at&limit=1`,
    );

    if (response && !response.ok) {
      response = await supabaseRequest(
        `wallet_profiles?wallet_address=eq.${encodeURIComponent(wallet)}&select=wallet_address,display_name,connected_health_apps,connected_app_count,health_permissions,reward_points,created_at,last_seen_at,reset_at&limit=1`,
      );
    }

    if (!response) {
      return NextResponse.json({ wallet: null });
    }

    if (!response.ok) {
      return NextResponse.json({ error: await response.text() }, { status: response.status });
    }

    const rows = (await response.json()) as Array<{
      wallet_address: string;
      display_name: string | null;
      connected_app_count: number | null;
      connected_health_apps: string[] | null;
      health_permissions: Record<string, string[]> | null;
      reward_points: number | null;
      guardian_data?: Record<string, unknown> | null;
      created_at: string;
      last_seen_at: string;
      reset_at: string | null;
    }>;
    const row = rows[0];
    let dailyRecords: Record<string, unknown> = {};
    if (row) {
      const dailyResponse = await supabaseRequest(
        `daily_records?wallet_address=eq.${encodeURIComponent(wallet)}&select=date_key,data&order=date_key.asc`,
      );
      if (dailyResponse?.ok) {
        const dailyRows = (await dailyResponse.json()) as Array<{ date_key: string; data: unknown }>;
        dailyRecords = Object.fromEntries(dailyRows.map((dailyRow) => [dailyRow.date_key, dailyRow.data]));
      }
    }

    return NextResponse.json({
      wallet: row
        ? {
            wallet: row.wallet_address,
            firstSeen: row.created_at,
            lastSeen: row.last_seen_at,
            displayName: row.display_name ?? "",
            connectedApps: row.connected_app_count ?? 0,
            connectedHealthApps: row.connected_health_apps ?? [],
            healthPermissions: row.health_permissions ?? {},
            rewardPoints: row.reward_points ?? 0,
            guardianData: row.guardian_data ?? undefined,
            dailyRecords,
            resetAt: row.reset_at ?? undefined,
          }
        : null,
    });
  }

  if (!requireAdmin(adminWallet)) {
    return NextResponse.json({ error: "Admin wallet required." }, { status: 403 });
  }

  let response = await supabaseRequest(
    "wallet_profiles?select=wallet_address,display_name,connected_app_count,reward_points,guardian_data,created_at,last_seen_at,reset_at&order=last_seen_at.desc",
  );

  if (response && !response.ok) {
    response = await supabaseRequest(
      "wallet_profiles?select=wallet_address,display_name,connected_app_count,reward_points,created_at,last_seen_at,reset_at&order=last_seen_at.desc",
    );
  }

  if (!response) {
    return NextResponse.json({ wallets: [] });
  }

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: response.status });
  }

  const rows = (await response.json()) as Array<{
    wallet_address: string;
    display_name: string | null;
    connected_app_count: number | null;
    reward_points: number | null;
    guardian_data?: Record<string, unknown> | null;
    created_at: string;
    last_seen_at: string;
    reset_at: string | null;
  }>;

  return NextResponse.json({
    wallets: rows.map((row) => ({
      wallet: row.wallet_address,
      firstSeen: row.created_at,
      lastSeen: row.last_seen_at,
      displayName: row.display_name ?? "",
      connectedApps: row.connected_app_count ?? 0,
      rewardPoints: row.reward_points ?? 0,
      guardianData: row.guardian_data ?? undefined,
      resetAt: row.reset_at ?? undefined,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as WalletRegistryPayload;
  const wallet = normalizeWallet(body.wallet ?? body.wallet_address);

  if (!wallet) {
    return NextResponse.json({ error: "wallet is required." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const profilePayload = {
    wallet_address: wallet,
    display_name: body.displayName ?? body.display_name ?? "",
    connected_app_count: body.connectedApps ?? body.connected_app_count ?? 0,
    connected_health_apps: body.connectedHealthApps ?? [],
    health_permissions: body.healthPermissions ?? {},
    reward_points: body.rewardPoints ?? body.reward_points ?? 0,
    ...(body.guardianData ? { guardian_data: body.guardianData } : {}),
    last_seen_at: now,
  };
  let response = await supabaseRequest("wallet_profiles?on_conflict=wallet_address", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(profilePayload),
  });

  if (response && !response.ok && body.guardianData) {
    const { guardian_data: _guardianData, ...legacyProfilePayload } = profilePayload;
    response = await supabaseRequest("wallet_profiles?on_conflict=wallet_address", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(legacyProfilePayload),
    });
  }

  if (!response) {
    return NextResponse.json({ ok: true, mode: "local-only" });
  }

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: response.status });
  }

  const dailyRows = Object.entries(body.dailyRecords ?? {}).map(([dateKey, data]) => ({
    wallet_address: wallet,
    date_key: dateKey,
    data,
    updated_at: now,
  }));
  if (dailyRows.length) {
    const dailyResponse = await supabaseRequest("daily_records?on_conflict=wallet_address,date_key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(dailyRows),
    });
    if (dailyResponse && !dailyResponse.ok) {
      return NextResponse.json({ error: await dailyResponse.text() }, { status: dailyResponse.status });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as WalletRegistryPayload;
  const targetWallet = normalizeWallet(body.targetWallet);

  if (!requireAdmin(body.adminWallet)) {
    return NextResponse.json({ error: "Admin wallet required." }, { status: 403 });
  }

  if (!targetWallet) {
    return NextResponse.json({ error: "targetWallet is required." }, { status: 400 });
  }

  if (targetWallet === ADMIN_WALLET) {
    return NextResponse.json({ error: "Admin wallet cannot be reset." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await supabaseRequest(`daily_records?wallet_address=eq.${encodeURIComponent(targetWallet)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await supabaseRequest(`wallet_events?wallet_address=eq.${encodeURIComponent(targetWallet)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await supabaseRequest(`admin_actions?target_wallet=eq.${encodeURIComponent(targetWallet)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });

  const response = await supabaseRequest("wallet_profiles?on_conflict=wallet_address", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      wallet_address: targetWallet,
      display_name: "",
      connected_health_apps: [],
      connected_app_count: 0,
      health_permissions: {},
      reward_points: 0,
      guardian_data: {
        guardian: null,
        careXp: 0,
        traits: [],
        lastProofWeek: "",
        proofReference: "",
      },
      last_seen_at: now,
      reset_at: now,
    }),
  });

  if (!response) {
    return NextResponse.json({ ok: true, mode: "local-only" });
  }

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: response.status });
  }

  return NextResponse.json({ ok: true, resetAt: now });
}
