import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PromiseStatus, SourceTier } from "@prisma/client";

// Business rule: check if promise has HIGH tier evidence
async function hasHighTierEvidence(promiseId: string): Promise<boolean> {
  const highTierEvidence = await prisma.evidence.findFirst({
    where: {
      promiseId,
      source: { tier: SourceTier.HIGH },
    },
  });
  return !!highTierEvidence;
}

// Add evidence to a promise
export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "addEvidence": {
        const { promiseId, sourceId, title, description, evidenceUrl, publishedDate } = body;
        const evidence = await prisma.evidence.create({
          data: {
            promiseId,
            sourceId,
            title,
            description,
            evidenceUrl: evidenceUrl || null,
            publishedDate: publishedDate ? new Date(publishedDate) : null,
          },
        });
        return NextResponse.json({ success: true, evidence });
      }

      case "addVerification": {
        const { promiseId, sourceId, status, notes, verifiedBy } = body;
        const verification = await prisma.verification.create({
          data: {
            promiseId,
            sourceId: sourceId || null,
            status,
            notes: notes || null,
            verifiedBy: verifiedBy || null,
          },
        });
        return NextResponse.json({ success: true, verification });
      }

      case "updateStatus": {
        const { promiseId, status, explanation, changedBy } = body;

        // BUSINESS RULE: IMPLEMENTED or PARTIALLY_IMPLEMENTED requires HIGH tier evidence
        if (
          status === PromiseStatus.IMPLEMENTED ||
          status === PromiseStatus.PARTIALLY_IMPLEMENTED
        ) {
          const hasHigh = await hasHighTierEvidence(promiseId);
          if (!hasHigh) {
            return NextResponse.json(
              {
                error: `Cannot set status to "${status === PromiseStatus.IMPLEMENTED ? "Implemented" : "Partially Implemented"}" without at least one evidence item linked to a HIGH tier source. A lower-tier source is not treated as "false" — it simply cannot be the sole basis for this status.`,
                code: "BUSINESS_RULE_VIOLATION",
              },
              { status: 422 }
            );
          }
        }

        // Upsert implementation status
        await prisma.implementationStatus.upsert({
          where: { promiseId },
          update: {
            status,
            explanation: explanation || null,
            lastUpdated: new Date(),
          },
          create: {
            promiseId,
            status,
            explanation: explanation || null,
          },
        });

        // Record in status history
        await prisma.statusHistory.create({
          data: {
            promiseId,
            status,
            explanation: explanation || null,
            changedBy: changedBy || null,
          },
        });

        return NextResponse.json({ success: true });
      }

      case "addSource": {
        const { name, url, sourceType, tier } = body;
        const source = await prisma.source.create({
          data: { name, url, sourceType, tier },
        });
        return NextResponse.json({ success: true, source });
      }

      case "addPromise": {
        const { manifestoId, title, description, category, sourceText } = body;
        const promise = await prisma.promise.create({
          data: {
            manifestoId,
            title,
            description,
            category,
            sourceText: sourceText || null,
          },
        });

        // Create initial NOT_STARTED status
        await prisma.implementationStatus.create({
          data: {
            promiseId: promise.id,
            status: PromiseStatus.NOT_STARTED,
            explanation: "Promise recorded from manifesto.",
          },
        });

        await prisma.statusHistory.create({
          data: {
            promiseId: promise.id,
            status: PromiseStatus.NOT_STARTED,
            explanation: "Promise recorded from manifesto.",
            changedBy: changedBy(session),
          },
        });

        return NextResponse.json({ success: true, promise });
      }

      case "editPromise": {
        const { promiseId, title, description, category, sourceText } = body;
        const promise = await prisma.promise.update({
          where: { id: promiseId },
          data: {
            title,
            description,
            category,
            sourceText: sourceText || null,
          },
        });
        return NextResponse.json({ success: true, promise });
      }

      case "addManifesto": {
        const { electionId, partyId, title, documentUrl, publishedDate, version } = body;
        const manifesto = await prisma.manifesto.create({
          data: {
            electionId,
            partyId,
            title,
            documentUrl: documentUrl || null,
            publishedDate: publishedDate ? new Date(publishedDate) : null,
            version: version || "1.0",
          },
        });
        return NextResponse.json({ success: true, manifesto });
      }

      case "importManifesto": {
        const { manifestoId, text, category: defaultCategory } = body;
        // Split text by newlines, each non-empty line becomes a promise
        const lines = text
          .split("\n")
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        const created = [];
        for (const line of lines) {
          const promise = await prisma.promise.create({
            data: {
              manifestoId,
              title: line.length > 100 ? line.substring(0, 100) + "..." : line,
              description: line,
              category: defaultCategory || "Uncategorized",
              sourceText: line,
            },
          });

          await prisma.implementationStatus.create({
            data: {
              promiseId: promise.id,
              status: PromiseStatus.NOT_STARTED,
              explanation: "Promise imported from manifesto text.",
            },
          });

          created.push(promise);
        }

        return NextResponse.json({ success: true, count: created.length });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function changedBy(session: { user?: { name?: string | null } } | null): string {
  return session?.user?.name || "Admin";
}
