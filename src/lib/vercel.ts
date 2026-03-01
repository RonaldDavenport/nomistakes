// Vercel API integration for deploying generated business sites
// Docs: https://vercel.com/docs/rest-api

const VERCEL_API = "https://api.vercel.com";

// Read at call-time so env vars are always fresh
function getToken() {
  return process.env.VERCEL_TOKEN || "";
}

function headers() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

function teamParam() {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${teamId}` : "";
}

export interface DeployResult {
  projectId: string;
  deploymentId: string;
  url: string;
  readyState: string;
}

// Ensure project exists — create if needed, return { name, isNew }
async function ensureProject(slug: string): Promise<{ name: string; isNew: boolean }> {
  const projectName = `nm-${slug}`;

  // Try to get existing project first (faster than create-then-catch)
  console.log(`[vercel] checking project ${projectName}`);
  const checkRes = await fetch(`${VERCEL_API}/v9/projects/${projectName}${teamParam()}`, {
    headers: headers(),
  });

  if (checkRes.ok) {
    console.log(`[vercel] project ${projectName} exists`);
    return { name: projectName, isNew: false };
  }

  console.log(`[vercel] project ${projectName} not found (${checkRes.status}), creating...`);

  // Create new project
  const res = await fetch(`${VERCEL_API}/v10/projects${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: projectName,
      framework: "nextjs",
      buildCommand: "next build",
      outputDirectory: ".next",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    if (err.error?.code === "project_already_exists" || err.error?.code === "conflict") {
      console.log(`[vercel] project ${projectName} race-created, OK`);
      return { name: projectName, isNew: false };
    }
    throw new Error(`Failed to create project: ${JSON.stringify(err)}`);
  }

  console.log(`[vercel] project ${projectName} created`);
  return { name: projectName, isNew: true };
}

// Set env vars on a project (only for new projects — skips if already set)
async function ensureEnvVars(projectName: string, envVars: Record<string, string>): Promise<void> {
  // Check which env vars already exist
  console.log(`[vercel] listing env vars for ${projectName}`);
  const listRes = await fetch(`${VERCEL_API}/v9/projects/${projectName}/env${teamParam()}`, {
    headers: headers(),
  });

  const existingKeys = new Set<string>();
  if (listRes.ok) {
    const data = await listRes.json();
    for (const env of data.envs || []) {
      existingKeys.add(env.key);
    }
  }

  // Only set vars that don't exist yet
  const missing = Object.entries(envVars).filter(([key]) => !existingKeys.has(key));
  if (missing.length === 0) {
    console.log(`[vercel] all env vars already set`);
    return;
  }

  console.log(`[vercel] setting ${missing.length} missing env vars: ${missing.map(([k]) => k).join(", ")}`);
  await Promise.all(
    missing.map(([key, value]) =>
      fetch(`${VERCEL_API}/v10/projects/${projectName}/env${teamParam()}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          key,
          value,
          type: "encrypted",
          target: ["production", "preview"],
        }),
      })
    )
  );
  console.log(`[vercel] env vars set`);
}

// Deploy files to a Vercel project
export async function deploy(
  slug: string,
  files: { file: string; data: string }[],
  envVars?: Record<string, string>
): Promise<DeployResult> {
  // Step 1: Ensure project exists + set env vars (only for new projects)
  const { name: projectName, isNew } = await ensureProject(slug);

  if (isNew && envVars && Object.keys(envVars).length > 0) {
    await ensureEnvVars(projectName, envVars);
  }

  // Step 2: Deploy
  const payload = {
    name: projectName,
    target: "production",
    files: files.map((f) => ({
      file: f.file,
      data: Buffer.from(f.data).toString("base64"),
      encoding: "base64",
    })),
    projectSettings: {
      framework: "nextjs",
      buildCommand: "next build",
      outputDirectory: ".next",
      nodeVersion: "20.x",
    },
  };

  const payloadSize = JSON.stringify(payload).length;
  console.log(`[vercel] deploying ${files.length} files (${(payloadSize / 1024).toFixed(0)}KB payload) to ${projectName}`);

  const res = await fetch(`${VERCEL_API}/v13/deployments${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Deployment API ${res.status}: ${JSON.stringify(err)}`);
  }

  const deployment = await res.json();
  const projectUrl = `https://${projectName}.vercel.app`;
  console.log(`[vercel] deployment created: ${deployment.id} → ${projectUrl}`);
  return {
    projectId: deployment.projectId,
    deploymentId: deployment.id,
    url: projectUrl,
    readyState: deployment.readyState,
  };
}

// Add a custom domain to a Vercel project
export async function addDomain(slug: string, domain: string): Promise<{ configured: boolean }> {
  const projectName = `nm-${slug}`;
  const res = await fetch(`${VERCEL_API}/v10/projects/${projectName}/domains${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name: domain }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to add domain: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return { configured: data.verified };
}

// Get domain verification records (for user to set up DNS)
export async function getDomainConfig(domain: string): Promise<{
  configured: boolean;
  records: { type: string; name: string; value: string }[];
}> {
  const res = await fetch(`${VERCEL_API}/v6/domains/${domain}/config${teamParam()}`, {
    headers: headers(),
  });

  if (!res.ok) {
    return { configured: false, records: [] };
  }

  const data = await res.json();
  return {
    configured: !data.misconfigured,
    records: data.cnames || [],
  };
}

// Check if Vercel API is configured
export function isConfigured(): boolean {
  return !!process.env.VERCEL_TOKEN;
}
