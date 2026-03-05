// Apollo.io People Search API client for lead discovery

export interface LeadCandidate {
  name: string | null;
  email: string | null; // null when Apollo hasn't revealed it (no reveal credits spent)
  linkedin_url: string | null;
  title: string | null;
  company: string | null;
  source: "apollo";
}

interface ApolloSearchParams {
  titles?: string[];
  industries?: string[];
  locations?: string[];
  page?: number;
  perPage?: number;
}

interface ApolloPerson {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  title?: string | null;
  organization?: { name?: string | null } | null;
}

interface ApolloSearchResponse {
  people?: ApolloPerson[];
  contacts?: ApolloPerson[];
  error_code?: string;
  message?: string;
}

export async function apolloSearch(params: ApolloSearchParams): Promise<LeadCandidate[]> {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) throw new Error("APOLLO_API_KEY is not configured");

  const body: Record<string, unknown> = {
    page: params.page ?? 1,
    per_page: params.perPage ?? 25,
  };

  if (params.titles?.length) body.person_titles = params.titles;
  if (params.industries?.length) body.organization_industry_tag_ids = params.industries;
  if (params.locations?.length) body.person_locations = params.locations;

  const res = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Apollo API error ${res.status}: ${text}`);
  }

  const data: ApolloSearchResponse = await res.json();

  if (data.error_code) {
    throw new Error(`Apollo API error: ${data.message ?? data.error_code}`);
  }

  const people = data.people ?? data.contacts ?? [];

  return people.map((p): LeadCandidate => {
    const firstName = p.first_name?.trim() ?? "";
    const lastName = p.last_name?.trim() ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || null;

    return {
      name,
      email: p.email ?? null,
      linkedin_url: p.linkedin_url ?? null,
      title: p.title ?? null,
      company: p.organization?.name ?? null,
      source: "apollo",
    };
  });
}
