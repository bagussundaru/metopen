import { NextResponse } from "next/server";
import {
  fetchOpenAlexWorks,
  buildNetworkFromOpenAlexWorks,
} from "@/lib/parsers/openalex-parser";
import { fetchElsevierScopusApi } from "@/lib/parsers/scopus-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const minOccurrences = parseInt(searchParams.get("minOccurrences") || "2", 10);
  const scopusApiKey =
    req.headers.get("x-scopus-api-key") ||
    searchParams.get("apiKey") ||
    process.env.SCOPUS_API_KEY ||
    "";

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required." },
      { status: 400 }
    );
  }

  try {
    // If Elsevier Scopus API key is provided, try direct Elsevier search
    if (scopusApiKey.trim()) {
      try {
        const scopusArticles = await fetchElsevierScopusApi(query, scopusApiKey.trim(), 35);
        if (scopusArticles.length > 0) {
          // Adapt Scopus articles to raw works structure for network building
          const rawWorks = scopusArticles.map((art) => ({
            id: art.id,
            title: art.title,
            publication_year: art.year,
            cited_by_count: art.citedByCount,
            doi: art.doi,
            type: art.docType,
            isOpenAccess: art.isOpenAccess,
            primary_location: {
              source: { display_name: art.journal },
            },
            authorships: art.authors
              .split(/,\s*/)
              .map((name) => ({ author: { display_name: name } })),
            keywords: art.keywords.map((kw) => ({ display_name: kw })),
            concepts: [],
            biblio: {
              volume: art.volume,
              issue: art.issue,
              first_page: art.pages,
            },
          }));

          const result = buildNetworkFromOpenAlexWorks(query, rawWorks, minOccurrences);
          return NextResponse.json(result);
        }
      } catch (scopusErr) {
        console.warn("Direct Elsevier Scopus API failed, falling back to curated Scopus index:", scopusErr);
      }
    }

    const rawWorks = await fetchOpenAlexWorks(query, 35);
    const result = buildNetworkFromOpenAlexWorks(query, rawWorks, minOccurrences);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengambil data literatur.";
    return NextResponse.json(
      { error: "LITERATURE_SEARCH_ERROR", message: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.query || "";
    const minOccurrences = Number(body.minOccurrences || 2);
    const scopusApiKey =
      req.headers.get("x-scopus-api-key") ||
      body.apiKey ||
      process.env.SCOPUS_API_KEY ||
      "";

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Body field 'query' is required." },
        { status: 400 }
      );
    }

    if (scopusApiKey.trim()) {
      try {
        const scopusArticles = await fetchElsevierScopusApi(query, scopusApiKey.trim(), 35);
        if (scopusArticles.length > 0) {
          const rawWorks = scopusArticles.map((art) => ({
            id: art.id,
            title: art.title,
            publication_year: art.year,
            cited_by_count: art.citedByCount,
            doi: art.doi,
            type: art.docType,
            isOpenAccess: art.isOpenAccess,
            primary_location: {
              source: { display_name: art.journal },
            },
            authorships: art.authors
              .split(/,\s*/)
              .map((name) => ({ author: { display_name: name } })),
            keywords: art.keywords.map((kw) => ({ display_name: kw })),
            concepts: [],
            biblio: {
              volume: art.volume,
              issue: art.issue,
              first_page: art.pages,
            },
          }));

          const result = buildNetworkFromOpenAlexWorks(query, rawWorks, minOccurrences);
          return NextResponse.json(result);
        }
      } catch (scopusErr) {
        console.warn("Direct Elsevier Scopus API failed, falling back to curated Scopus index:", scopusErr);
      }
    }

    const rawWorks = await fetchOpenAlexWorks(query, 35);
    const result = buildNetworkFromOpenAlexWorks(query, rawWorks, minOccurrences);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengambil data literatur.";
    return NextResponse.json(
      { error: "LITERATURE_SEARCH_ERROR", message: errorMsg },
      { status: 500 }
    );
  }
}
