import { PrismaClient, SourceTier, PromiseStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.statusHistory.deleteMany();
  await prisma.implementationStatus.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.source.deleteMany();
  await prisma.promise.deleteMany();
  await prisma.manifesto.deleteMany();
  await prisma.politicalParty.deleteMany();
  await prisma.election.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──
  const adminPassword = await bcrypt.hash("admin123", 10);
  const researcherPassword = await bcrypt.hash("researcher123", 10);

  const admin = await prisma.user.create({
    data: {
      id: uuid(),
      email: "admin@govex.demo",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const researcher = await prisma.user.create({
    data: {
      id: uuid(),
      email: "researcher@govex.demo",
      name: "Researcher User",
      password: researcherPassword,
      role: UserRole.RESEARCHER,
    },
  });

  console.log("✅ Users created");

  // ── Election ──
  const election = await prisma.election.create({
    data: {
      id: uuid(),
      name: "2024 General Election",
      electionDate: new Date("2024-04-15"),
      level: "National",
      jurisdiction: "Republic of Democrata",
    },
  });

  console.log("✅ Election created");

  // ── Political Parties ──
  const partyA = await prisma.politicalParty.create({
    data: {
      id: uuid(),
      name: "Progressive Alliance",
      abbreviation: "PA",
    },
  });

  const partyB = await prisma.politicalParty.create({
    data: {
      id: uuid(),
      name: "National Democratic Front",
      abbreviation: "NDF",
    },
  });

  console.log("✅ Parties created");

  // ── Manifestos ──
  const manifestoA = await prisma.manifesto.create({
    data: {
      id: uuid(),
      electionId: election.id,
      partyId: partyA.id,
      title: "Progressive Alliance Manifesto 2024",
      documentUrl: "https://example.gov/placeholder/pa-manifesto-2024.pdf",
      publishedDate: new Date("2024-03-01"),
      version: "1.0",
    },
  });

  const manifestoB = await prisma.manifesto.create({
    data: {
      id: uuid(),
      electionId: election.id,
      partyId: partyB.id,
      title: "NDF Vision Document 2024",
      documentUrl: "https://example.gov/placeholder/ndf-manifesto-2024.pdf",
      publishedDate: new Date("2024-03-10"),
      version: "1.0",
    },
  });

  console.log("✅ Manifestos created");

  // ── Sources (8 across 3 tiers) ──
  const sources = await Promise.all([
    // HIGH tier (3)
    prisma.source.create({
      data: {
        id: uuid(),
        name: "Official Government Gazette Notification",
        url: "https://example.gov/placeholder/gazette-2024-infrastructure.pdf",
        sourceType: "Government Gazette",
        tier: SourceTier.HIGH,
      },
    }),
    prisma.source.create({
      data: {
        id: uuid(),
        name: "National Budget 2024-25",
        url: "https://example.gov/placeholder/budget-2024-25.pdf",
        sourceType: "Budget Document",
        tier: SourceTier.HIGH,
      },
    }),
    prisma.source.create({
      data: {
        id: uuid(),
        name: "Department of Education Annual Report",
        url: "https://example.gov/placeholder/education-annual-report-2024.pdf",
        sourceType: "Departmental Report",
        tier: SourceTier.HIGH,
      },
    }),
    // MEDIUM tier (3)
    prisma.source.create({
      data: {
        id: uuid(),
        name: "Parliamentary Session Records – Budget Discussion",
        url: "https://example.gov/placeholder/parliament-budget-session.pdf",
        sourceType: "Parliamentary Record",
        tier: SourceTier.MEDIUM,
      },
    }),
    prisma.source.create({
      data: {
        id: uuid(),
        name: "Economic Policy Institute Report",
        url: "https://example.gov/placeholder/epi-employment-report.pdf",
        sourceType: "Institutional Report",
        tier: SourceTier.MEDIUM,
      },
    }),
    prisma.source.create({
      data: {
        id: uuid(),
        name: "Government Press Statement on Healthcare",
        url: "https://example.gov/placeholder/press-healthcare-reform.pdf",
        sourceType: "Government Statement",
        tier: SourceTier.MEDIUM,
      },
    }),
    // SUPPORTING tier (2)
    prisma.source.create({
      data: {
        id: uuid(),
        name: "National Times – Infrastructure Development Report",
        url: "https://example.gov/placeholder/news-infrastructure.html",
        sourceType: "News Article",
        tier: SourceTier.SUPPORTING,
      },
    }),
    prisma.source.create({
      data: {
        id: uuid(),
        name: "Policy Research Working Paper – Tax Reform",
        url: "https://example.gov/placeholder/research-tax-reform.pdf",
        sourceType: "Research Paper",
        tier: SourceTier.SUPPORTING,
      },
    }),
  ]);

  const [gazetteSource, budgetSource, eduReportSource, parliamentSource, epiSource, pressSource, newsSource, researchSource] = sources;

  console.log("✅ Sources created");

  // ── Promises (12 total: 6 per party, varied categories) ──
  const promisesData = [
    // Party A promises
    {
      manifestoId: manifestoA.id,
      title: "Build 10,000 km of National Highways",
      description: "Construct 10,000 kilometers of new national highways connecting tier-2 cities by 2029.",
      category: "Infrastructure",
      sourceText: "\"We commit to building 10,000 km of world-class national highways connecting every tier-2 city within five years of taking office.\"",
      status: PromiseStatus.IN_PROGRESS,
      explanation: "Construction has begun on 3,200 km. Budget allocated for first phase. Tender process ongoing for remaining segments.",
    },
    {
      manifestoId: manifestoA.id,
      title: "Create 5 Million New Jobs",
      description: "Generate 5 million new employment opportunities in manufacturing and services sectors.",
      category: "Employment",
      sourceText: "\"Our industrial policy will create 5 million new jobs in manufacturing, IT, and services within the first three years.\"",
      status: PromiseStatus.PARTIALLY_IMPLEMENTED,
      explanation: "Government reports indicate 2.1 million jobs created through new manufacturing zones and IT parks. Verified through official employment statistics.",
    },
    {
      manifestoId: manifestoA.id,
      title: "Universal School Internet Access",
      description: "Provide broadband internet connectivity to all government schools nationwide.",
      category: "Education",
      sourceText: "\"Every government school will have high-speed internet within two years. No child will be left behind in the digital age.\"",
      status: PromiseStatus.NOT_STARTED,
      explanation: "No official notification or budget allocation identified for this initiative as of the latest review.",
    },
    {
      manifestoId: manifestoA.id,
      title: "Free Primary Healthcare Clinics",
      description: "Establish 50,000 free primary healthcare clinics in rural areas.",
      category: "Healthcare",
      sourceText: "\"We will open 50,000 free primary healthcare clinics in villages and small towns, staffed with qualified doctors and nurses.\"",
      status: PromiseStatus.STALLED,
      explanation: "Initial pilot of 2,000 clinics launched but program stalled due to staffing shortages. No new clinics opened in the past 6 months.",
    },
    {
      manifestoId: manifestoA.id,
      title: "Reduce Corporate Tax to 20%",
      description: "Lower the corporate tax rate from 25% to 20% to boost investment.",
      category: "Taxation",
      sourceText: "\"We will bring the corporate tax rate down to 20%, making our economy one of the most competitive in the region.\"",
      status: PromiseStatus.IMPLEMENTED,
      explanation: "Corporate tax reduced to 20% via the Finance Act 2024-25, effective April 2025. Confirmed in official gazette notification.",
    },
    {
      manifestoId: manifestoA.id,
      title: "Direct Benefit Transfer for Farmers",
      description: "Provide ₹10,000 annual direct benefit transfer to all smallholder farmers.",
      category: "Welfare",
      sourceText: "\"Every smallholder farmer with up to 5 acres will receive ₹10,000 per year directly into their bank account.\"",
      status: PromiseStatus.UNVERIFIABLE,
      explanation: "Scheme announced but no verifiable disbursement data found in official records. Government has not published beneficiary statistics.",
    },
    // Party B promises
    {
      manifestoId: manifestoB.id,
      title: "500 Smart Cities Initiative",
      description: "Develop 500 cities with smart infrastructure including IoT-enabled utilities.",
      category: "Infrastructure",
      sourceText: "\"We envision 500 smart cities with IoT-enabled water, power, and waste management systems by 2030.\"",
      status: PromiseStatus.IN_PROGRESS,
      explanation: "52 cities selected for Phase 1. Master plans approved for 30 cities. Implementation underway in 12 cities.",
    },
    {
      manifestoId: manifestoB.id,
      title: "Skill Development for Youth",
      description: "Train 10 million youth in industry-relevant skills through public-private partnerships.",
      category: "Employment",
      sourceText: "\"Through partnerships with industry, we will skill 10 million young people in AI, manufacturing, and green energy.\"",
      status: PromiseStatus.PARTIALLY_IMPLEMENTED,
      explanation: "4.2 million youth enrolled in skill programs. Employment conversion rate of 62% reported in official statistics.",
    },
    {
      manifestoId: manifestoB.id,
      title: "Double Education Budget",
      description: "Increase education spending from 3% to 6% of GDP.",
      category: "Education",
      sourceText: "\"Education spending will be doubled to 6% of GDP, with focus on teacher training and research infrastructure.\"",
      status: PromiseStatus.NOT_STARTED,
      explanation: "Current budget allocation remains at 3.2% of GDP. No formal plan to increase announced.",
    },
    {
      manifestoId: manifestoB.id,
      title: "Universal Health Insurance",
      description: "Provide free health insurance coverage up to ₹10 lakh for every family.",
      category: "Healthcare",
      sourceText: "\"Every family will receive health insurance coverage of up to ₹10 lakh, eliminating catastrophic healthcare costs.\"",
      status: PromiseStatus.IMPLEMENTED,
      explanation: "Universal Health Coverage Act passed. Insurance cards issued to 85 million families. Budget allocation confirmed.",
    },
    {
      manifestoId: manifestoB.id,
      title: "Abolish Agricultural Income Tax",
      description: "Ensure agricultural income remains tax-free and extend exemptions to agro-processing.",
      category: "Taxation",
      sourceText: "\"Agricultural income will remain completely tax-free, and we will extend this exemption to agro-processing units.\"",
      status: PromiseStatus.STALLED,
      explanation: "Bill introduced in parliament but referred to standing committee. No progress in two consecutive sessions.",
    },
    {
      manifestoId: manifestoB.id,
      title: "Pension for All Informal Workers",
      description: "Provide minimum pension of ₹5,000/month for informal sector workers above age 60.",
      category: "Welfare",
      sourceText: "\"All informal sector workers above 60 will receive a guaranteed pension of ₹5,000 per month.\"",
      status: PromiseStatus.UNVERIFIABLE,
      explanation: "Program announced in budget speech but no implementation mechanism or disbursement data available for verification.",
    },
  ];

  const createdPromises = [];
  for (const p of promisesData) {
    const promise = await prisma.promise.create({
      data: {
        id: uuid(),
        manifestoId: p.manifestoId,
        title: p.title,
        description: p.description,
        category: p.category,
        sourceText: p.sourceText,
      },
    });
    createdPromises.push({ ...promise, _status: p.status, _explanation: p.explanation });
  }

  console.log("✅ Promises created");

  // ── Implementation Statuses ──
  for (const p of createdPromises) {
    await prisma.implementationStatus.create({
      data: {
        id: uuid(),
        promiseId: p.id,
        status: p._status,
        explanation: p._explanation,
        lastUpdated: new Date(),
      },
    });
  }

  console.log("✅ Implementation statuses created");

  // ── Evidence (linking promises to sources) ──
  // Promises that are IMPLEMENTED or PARTIALLY_IMPLEMENTED must have HIGH tier evidence
  const evidenceData = [
    // PA - Highway (IN_PROGRESS) - has HIGH + SUPPORTING evidence
    {
      promiseId: createdPromises[0].id,
      sourceId: gazetteSource.id,
      title: "Highway Construction Notification",
      description: "Official gazette notification authorizing Phase 1 highway construction covering 3,200 km.",
      evidenceUrl: "https://example.gov/placeholder/gazette-highway-phase1.pdf",
      publishedDate: new Date("2024-08-15"),
    },
    {
      promiseId: createdPromises[0].id,
      sourceId: newsSource.id,
      title: "Media Report on Highway Progress",
      description: "News coverage of construction progress with ground-level reporting from multiple states.",
      evidenceUrl: "https://example.gov/placeholder/news-highway-progress.html",
      publishedDate: new Date("2025-01-20"),
    },
    // PA - Jobs (PARTIALLY_IMPLEMENTED) - needs HIGH tier evidence
    {
      promiseId: createdPromises[1].id,
      sourceId: budgetSource.id,
      title: "Employment Statistics from Budget Document",
      description: "Official budget document citing 2.1 million jobs created through manufacturing zones.",
      evidenceUrl: "https://example.gov/placeholder/budget-employment-stats.pdf",
      publishedDate: new Date("2025-02-01"),
    },
    {
      promiseId: createdPromises[1].id,
      sourceId: epiSource.id,
      title: "Independent Employment Analysis",
      description: "Economic Policy Institute analysis corroborating government job creation figures.",
      evidenceUrl: "https://example.gov/placeholder/epi-jobs-analysis.pdf",
      publishedDate: new Date("2025-03-15"),
    },
    // PA - Corporate Tax (IMPLEMENTED) - needs HIGH tier evidence
    {
      promiseId: createdPromises[4].id,
      sourceId: gazetteSource.id,
      title: "Finance Act 2024-25 Gazette Notification",
      description: "Official gazette notification of the Finance Act reducing corporate tax to 20%.",
      evidenceUrl: "https://example.gov/placeholder/gazette-finance-act.pdf",
      publishedDate: new Date("2025-04-01"),
    },
    {
      promiseId: createdPromises[4].id,
      sourceId: parliamentSource.id,
      title: "Parliamentary Debate on Tax Bill",
      description: "Record of parliamentary debate and vote on the corporate tax reduction bill.",
      evidenceUrl: "https://example.gov/placeholder/parliament-tax-debate.pdf",
      publishedDate: new Date("2025-03-20"),
    },
    // PA - Healthcare (STALLED) - MEDIUM evidence
    {
      promiseId: createdPromises[3].id,
      sourceId: pressSource.id,
      title: "Government Statement on Clinic Program",
      description: "Press statement acknowledging staffing challenges in the free clinic program.",
      evidenceUrl: "https://example.gov/placeholder/press-clinic-update.pdf",
      publishedDate: new Date("2025-06-10"),
    },
    // NB - Smart Cities (IN_PROGRESS) - MEDIUM + SUPPORTING
    {
      promiseId: createdPromises[6].id,
      sourceId: parliamentSource.id,
      title: "Smart Cities Committee Report",
      description: "Parliamentary committee report on Phase 1 city selection and implementation status.",
      evidenceUrl: "https://example.gov/placeholder/parliament-smart-cities.pdf",
      publishedDate: new Date("2025-04-05"),
    },
    {
      promiseId: createdPromises[6].id,
      sourceId: newsSource.id,
      title: "Smart Cities Ground Report",
      description: "Investigative news report on smart city implementation in 12 pilot cities.",
      evidenceUrl: "https://example.gov/placeholder/news-smart-cities.html",
      publishedDate: new Date("2025-07-01"),
    },
    // NB - Skills (PARTIALLY_IMPLEMENTED) - needs HIGH
    {
      promiseId: createdPromises[7].id,
      sourceId: eduReportSource.id,
      title: "Skill Development Annual Statistics",
      description: "Department of Education report with enrollment and conversion rate data for skill programs.",
      evidenceUrl: "https://example.gov/placeholder/education-skills-stats.pdf",
      publishedDate: new Date("2025-05-15"),
    },
    // NB - Health Insurance (IMPLEMENTED) - needs HIGH
    {
      promiseId: createdPromises[9].id,
      sourceId: gazetteSource.id,
      title: "Universal Health Coverage Act Notification",
      description: "Official gazette notification of the Universal Health Coverage Act and implementation rules.",
      evidenceUrl: "https://example.gov/placeholder/gazette-health-act.pdf",
      publishedDate: new Date("2024-12-01"),
    },
    {
      promiseId: createdPromises[9].id,
      sourceId: budgetSource.id,
      title: "Health Insurance Budget Allocation",
      description: "Budget document confirming ₹50,000 crore allocation for universal health insurance.",
      evidenceUrl: "https://example.gov/placeholder/budget-health-insurance.pdf",
      publishedDate: new Date("2025-02-01"),
    },
    // NB - Agri Tax (STALLED) - SUPPORTING only
    {
      promiseId: createdPromises[10].id,
      sourceId: researchSource.id,
      title: "Research Paper on Agro Tax Exemptions",
      description: "Policy research paper analyzing economic impact of extending tax exemptions to agro-processing.",
      evidenceUrl: "https://example.gov/placeholder/research-agro-tax.pdf",
      publishedDate: new Date("2025-01-10"),
    },
  ];

  for (const e of evidenceData) {
    await prisma.evidence.create({
      data: {
        id: uuid(),
        ...e,
      },
    });
  }

  console.log("✅ Evidence created");

  // ── Verifications ──
  const verificationData = [
    {
      promiseId: createdPromises[0].id,
      sourceId: gazetteSource.id,
      status: PromiseStatus.IN_PROGRESS,
      notes: "Construction confirmed through official gazette. Progress verified at 32% of target.",
      verifiedBy: researcher.name,
    },
    {
      promiseId: createdPromises[1].id,
      sourceId: budgetSource.id,
      status: PromiseStatus.PARTIALLY_IMPLEMENTED,
      notes: "Budget document confirms 2.1M jobs. Target is 5M, so partially implemented.",
      verifiedBy: researcher.name,
    },
    {
      promiseId: createdPromises[4].id,
      sourceId: gazetteSource.id,
      status: PromiseStatus.IMPLEMENTED,
      notes: "Tax rate reduction confirmed in Finance Act. Verified through gazette notification.",
      verifiedBy: admin.name,
    },
    {
      promiseId: createdPromises[7].id,
      sourceId: eduReportSource.id,
      status: PromiseStatus.PARTIALLY_IMPLEMENTED,
      notes: "4.2M of 10M target enrolled. Conversion rate data verified through department report.",
      verifiedBy: researcher.name,
    },
    {
      promiseId: createdPromises[9].id,
      sourceId: gazetteSource.id,
      status: PromiseStatus.IMPLEMENTED,
      notes: "Act passed and insurance cards distributed. Budget allocation confirmed.",
      verifiedBy: admin.name,
    },
  ];

  for (const v of verificationData) {
    await prisma.verification.create({
      data: {
        id: uuid(),
        ...v,
      },
    });
  }

  console.log("✅ Verifications created");

  // ── Status History (showing progression) ──
  const historyData = [
    // Highway promise progression
    {
      promiseId: createdPromises[0].id,
      status: PromiseStatus.NOT_STARTED,
      explanation: "Promise recorded from manifesto. No action identified yet.",
      changedAt: new Date("2024-05-01"),
      changedBy: admin.name,
    },
    {
      promiseId: createdPromises[0].id,
      status: PromiseStatus.IN_PROGRESS,
      explanation: "Official gazette notification issued for Phase 1. Construction tenders awarded.",
      changedAt: new Date("2024-09-15"),
      changedBy: researcher.name,
    },
    // Corporate tax progression
    {
      promiseId: createdPromises[4].id,
      status: PromiseStatus.NOT_STARTED,
      explanation: "Promise recorded from manifesto.",
      changedAt: new Date("2024-05-01"),
      changedBy: admin.name,
    },
    {
      promiseId: createdPromises[4].id,
      status: PromiseStatus.IN_PROGRESS,
      explanation: "Finance Bill introduced in parliament with proposed tax reduction.",
      changedAt: new Date("2025-02-15"),
      changedBy: researcher.name,
    },
    {
      promiseId: createdPromises[4].id,
      status: PromiseStatus.IMPLEMENTED,
      explanation: "Finance Act passed. Gazette notification confirms 20% corporate tax rate effective April 2025.",
      changedAt: new Date("2025-04-01"),
      changedBy: admin.name,
    },
    // Healthcare clinics progression
    {
      promiseId: createdPromises[3].id,
      status: PromiseStatus.NOT_STARTED,
      explanation: "Promise recorded from manifesto.",
      changedAt: new Date("2024-05-01"),
      changedBy: admin.name,
    },
    {
      promiseId: createdPromises[3].id,
      status: PromiseStatus.IN_PROGRESS,
      explanation: "Pilot program launched with 2,000 clinics in select districts.",
      changedAt: new Date("2024-11-01"),
      changedBy: researcher.name,
    },
    {
      promiseId: createdPromises[3].id,
      status: PromiseStatus.STALLED,
      explanation: "Program stalled due to staffing shortages. No new clinics opened since Q1 2025.",
      changedAt: new Date("2025-06-15"),
      changedBy: researcher.name,
    },
    // Universal Health Insurance progression
    {
      promiseId: createdPromises[9].id,
      status: PromiseStatus.NOT_STARTED,
      explanation: "Promise recorded from manifesto.",
      changedAt: new Date("2024-05-01"),
      changedBy: admin.name,
    },
    {
      promiseId: createdPromises[9].id,
      status: PromiseStatus.IN_PROGRESS,
      explanation: "Universal Health Coverage Bill tabled in parliament.",
      changedAt: new Date("2024-10-01"),
      changedBy: researcher.name,
    },
    {
      promiseId: createdPromises[9].id,
      status: PromiseStatus.IMPLEMENTED,
      explanation: "Act passed and gazette notification issued. Insurance cards distributed to 85M families.",
      changedAt: new Date("2025-01-15"),
      changedBy: admin.name,
    },
  ];

  for (const h of historyData) {
    await prisma.statusHistory.create({
      data: {
        id: uuid(),
        ...h,
      },
    });
  }

  console.log("✅ Status history created");
  console.log("🎉 Seed complete!");
  console.log("");
  console.log("Demo credentials:");
  console.log("  Admin:      admin@govex.demo / admin123");
  console.log("  Researcher: researcher@govex.demo / researcher123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
