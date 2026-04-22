import { NextResponse } from "next/server";
import {
  URL_PIPELINE_VERSION,
  UrlIntakeError,
  buildPipelineHeaders,
  getRailwayJobSnapshot,
} from "@/lib/railway-server";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/analyze/[jobId]">
) {
  const { jobId } = await context.params;

  try {
    const snapshot = await getRailwayJobSnapshot(jobId);
    return NextResponse.json(snapshot, {
      headers: buildPipelineHeaders(),
    });
  } catch (error) {
    if (error instanceof UrlIntakeError) {
      return NextResponse.json(
        {
          error: error.code,
          userMessage: error.userMessage,
          needsUpload: error.needsUpload,
          pipelineVersion: URL_PIPELINE_VERSION,
        },
        {
          status: error.status,
          headers: buildPipelineHeaders(),
        }
      );
    }

    console.error("[api/analyze/:jobId] unexpected error", error);
    return NextResponse.json(
      {
        error: "INTERNAL",
        userMessage:
          "Une erreur inattendue est survenue pendant le suivi du diagnostic.",
        needsUpload: false,
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      {
        status: 500,
        headers: buildPipelineHeaders(),
      }
    );
  }
}
