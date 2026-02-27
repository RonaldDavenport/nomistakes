// Vercel API integration for deploying generated business sites
// Docs: https://vercel.com/docs/rest-api

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_API = "https://api.vercel.com";

function headers() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function teamParam() {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";
}

export interface DeployResult {
  projectId: string;
  deploymentId: string;
  url: string;
  readyState: string;
}

// Create a new Vercel project for a business
export async function createProject(name: string, slug: string): Promise<{ id: string; name: string }> {
  const projectName = `nm-${slug}`;

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
    // Project might already exist
    if (err.error?.code === "project_already_exists") {
      const existingRes = await fetch(`${VERCEL_API}/v9/projects/${projectName}${teamParam()}`, {
        headers: headers(),
      });
      const existing = await existingRes.json();
      return { id: existing.id, name: existing.name };
    }
    throw new Error(`Failed to create project: ${JSON.stringify(err)}`);
  }

  const project = await res.json();
  return { id: project.id, name: project.name };
}

// Deploy files to a Vercel project using the v13 deployments API
export async function deploy(
  projectName: string,
  files: { file: string; data: string }[],
  envVars?: Record<string, string>
): Promise<DeployResult> {
  // Set env vars on the project if provided
  if (envVars && Object.keys(envVars).length > 0) {
    for (const [key, value] of Object.entries(envVars)) {
      await fetch(`${VERCEL_API}/v10/projects/${projectName}/env${teamParam()}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          key,
          value,
          type: "encrypted",
          target: ["production", "preview"],
        }),
      });
    }
  }

  const res = await fetch(`${VERCEL_API}/v13/deployments${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: projectName,
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
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Deployment failed: ${JSON.stringify(err)}`);
  }

  const deployment = await res.json();
  return {
    projectId: deployment.projectId,
    deploymentId: deployment.id,
    url: `https://${deployment.url}`,
    readyState: deployment.readyState,
  };
}

// Add a custom domain to a Vercel project
export async function addDomain(projectName: string, domain: string): Promise<{ configured: boolean }> {
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
  return !!VERCEL_TOKEN;
}
