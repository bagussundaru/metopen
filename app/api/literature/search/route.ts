import { NextResponse } from "next/server";
import {
  fetchOpenAlexWorks,
  buildNetworkFromOpenAlexWorks,
} from "@/lib/parsers/openalex-parser";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const minOccurrences = parseInt(searchParams.get("minOccurrences") || "2", 10);

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required." },
      { status: 400 }
    );
  }

  try {
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

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Body field 'query' is required." },
        { status: 400 }
      );
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
