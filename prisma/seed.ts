import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.certificate.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.checklistCompletion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.reflectionQuestion.deleteMany();
  await prisma.mapPoint.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cohort.deleteMany();

  console.log("Creating cohorts...");
  const augustCohort = await prisma.cohort.create({
    data: { name: "August 2026 Global Cohort", startDate: daysAgo(20) },
  });
  const septCohort = await prisma.cohort.create({
    data: { name: "September 2026 APAC Cohort", startDate: daysAgo(3) },
  });

  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      name: "Nikhil Sharda",
      email: "nikhil.sharda@msmunify.com",
      title: "AVP, Marketing",
      vertical: "Marketing",
      country: "India",
      track: "FOUNDATION",
      role: "ADMIN",
      startDate: daysAgo(400),
      avatarColor: "#005BAA",
    },
  });

  const foundationUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya.nair@msmunify.com",
        title: "Student Recruitment Associate",
        vertical: "Student Recruitment",
        country: "India",
        track: "FOUNDATION",
        managerName: "Arjun Mehta",
        buddyName: "Fatima Al-Sayed",
        startDate: daysAgo(4),
        cohortId: septCohort.id,
        avatarColor: "#E8252A",
      },
    }),
    prisma.user.create({
      data: {
        name: "Diego Fernandez",
        email: "diego.fernandez@msmunify.com",
        title: "Partnerships Coordinator",
        vertical: "Institution Partnerships",
        country: "Mexico",
        track: "FOUNDATION",
        managerName: "Laura Chen",
        buddyName: "Kwame Boateng",
        startDate: daysAgo(0),
        cohortId: septCohort.id,
        avatarColor: "#FCAF17",
      },
    }),
    prisma.user.create({
      data: {
        name: "Amara Okafor",
        email: "amara.okafor@msmunify.com",
        title: "Marketing Associate",
        vertical: "Marketing",
        country: "Nigeria",
        track: "FOUNDATION",
        managerName: "Sofia Rossi",
        buddyName: "Ravi Kapoor",
        startDate: daysAgo(14),
        cohortId: augustCohort.id,
        avatarColor: "#005BAA",
      },
    }),
    prisma.user.create({
      data: {
        name: "Wei Zhang",
        email: "wei.zhang@msmunify.com",
        title: "Product Analyst Intern",
        vertical: "Product & Technology",
        country: "China",
        track: "FOUNDATION",
        managerName: "Hannah Kim",
        buddyName: "Diego Fernandez",
        startDate: daysAgo(28),
        cohortId: augustCohort.id,
        avatarColor: "#E8252A",
      },
    }),
    prisma.user.create({
      data: {
        name: "Fatima Al-Sayed",
        email: "fatima.alsayed@msmunify.com",
        title: "Customer Success Associate",
        vertical: "Customer Success",
        country: "UAE",
        track: "FOUNDATION",
        managerName: "Arjun Mehta",
        buddyName: "Amara Okafor",
        startDate: daysAgo(9),
        cohortId: septCohort.id,
        avatarColor: "#FCAF17",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jonas Berg",
        email: "jonas.berg@msmunify.com",
        title: "Finance & Ops Associate",
        vertical: "Finance & Operations",
        country: "Sweden",
        track: "FOUNDATION",
        managerName: "Laura Chen",
        buddyName: "Hannah Kim",
        startDate: daysAgo(35),
        cohortId: augustCohort.id,
        avatarColor: "#005BAA",
      },
    }),
  ]);
  const [priya, diego, amara, wei, fatima, jonas] = foundationUsers;

  const leadershipUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Meera Krishnan",
        email: "meera.krishnan@msmunify.com",
        title: "Director, Partnerships",
        vertical: "Institution Partnerships",
        country: "Singapore",
        track: "LEADERSHIP",
        startDate: daysAgo(10),
        cohortId: augustCohort.id,
        avatarColor: "#E8252A",
      },
    }),
    prisma.user.create({
      data: {
        name: "Carlos Iglesias",
        email: "carlos.iglesias@msmunify.com",
        title: "Director, Growth Marketing",
        vertical: "Marketing",
        country: "Spain",
        track: "LEADERSHIP",
        startDate: daysAgo(2),
        cohortId: septCohort.id,
        avatarColor: "#005BAA",
      },
    }),
  ]);
  const [meera] = leadershipUsers;

  console.log("Creating modules...");

  const welcomeVideo = await prisma.module.create({
    data: {
      slug: "founder-welcome",
      type: "VIDEO",
      title: "Welcome from our Founder",
      subtitle: "Sanjay Laul, Founder, MSM Unify",
      track: "BOTH",
      day: 1,
      order: 1,
      body: "Sanjay opens Unify Beginnings with why this company exists: building nations through education, and why the work you're about to do matters at global scale.",
      quoteText: "We are not building a company. We are building the infrastructure for how the world learns and works.",
      quoteAuthor: "Sanjay Laul, Founder",
      videoIsPlaceholder: true,
    },
  });

  const mapModule = await prisma.module.create({
    data: {
      slug: "our-footprint",
      type: "MAP",
      title: "Where We Operate",
      subtitle: "30+ countries. 400+ partner institutions. 6,000+ channel partners.",
      track: "BOTH",
      day: 1,
      order: 2,
      body: "Click around the map. Every dot is a country where MSM Unify is actively changing someone's access to education or work.",
    },
  });
  const mapPoints: Array<[string, number, number, number, number, number, string]> = [
    ["India", 66, 55, 120, 1800, 420000, "Our largest agent and institution network, and home to our biggest single learner population."],
    ["United States", 22, 40, 65, 900, 180000, "Deep partnerships across state and private universities, anchored by Florida Coastal University."],
    ["United Arab Emirates", 60, 50, 40, 650, 95000, "A regional hub connecting South Asian and African learners to Gulf and Western pathways."],
    ["Nigeria", 50, 60, 35, 720, 140000, "One of our fastest-growing agent networks on the continent."],
    ["Philippines", 78, 58, 48, 610, 110000, "A strong pipeline of healthcare and vocational talent moving through Staff UNO."],
    ["Canada", 21, 33, 38, 480, 76000, "Multihexa and ETON College anchor our Canadian career-college footprint."],
    ["United Kingdom", 46, 34, 30, 410, 58000, "Our European base for GMO agent proposals and UK-market institution partners."],
    ["China", 82, 42, 55, 690, 165000, "A growing base of tech-track learners moving through Q Academy pathways."],
    ["Mexico", 15, 55, 28, 340, 52000, "The anchor market for our LatAm partnerships expansion."],
    ["Singapore", 80, 62, 26, 300, 44000, "Our APAC operations base and a growing Director-level leadership hub."],
  ];
  await Promise.all(
    mapPoints.map(([country, x, y, partners, cp, lives, blurb], i) =>
      prisma.mapPoint.create({
        data: { moduleId: mapModule.id, country, x, y, partners, channelPartners: cp, livesImpacted: lives, blurb, order: i },
      })
    )
  );

  const meetYourPeople = await prisma.module.create({
    data: {
      slug: "meet-your-people",
      type: "CHECKLIST",
      title: "Meet Your People",
      subtitle: "The parts of onboarding no system should automate",
      track: "BOTH",
      day: 3,
      order: 1,
      body: "Work through this with your buddy and manager in real time, over a call or in person. Nothing here checks itself off.",
    },
  });
  const checklistItems = [
    ["Buddy session", "Grab 30 minutes with your assigned buddy. Ask them anything you'd never ask your manager."],
    ["Manager 1:1", "Sit down with your manager to align on your first 30/60/90 and how they like to work."],
    ["Corporate induction", "Complete the live corporate induction walkthrough with People Ops."],
    ["Team icebreaker", "Join (or host) an icebreaker with your immediate team."],
  ];
  await Promise.all(
    checklistItems.map(([label, helper], i) =>
      prisma.checklistItem.create({ data: { moduleId: meetYourPeople.id, label, helper, order: i } })
    )
  );

  const missionQuiz = await prisma.module.create({
    data: {
      slug: "know-your-mission",
      type: "QUIZ",
      title: "Know Your Mission",
      subtitle: "A quick check on vision, mission, and values",
      track: "FOUNDATION",
      day: 5,
      order: 1,
      body: "80% or better earns your badge. Retake as many times as you need, no penalty.",
      passThreshold: 80,
    },
  });
  const missionQs: Array<[string, string[], number, string]> = [
    ["What is MSM Unify's stated vision?", ["Building Nations with Education and Workforce Development", "Becoming the largest edtech company by revenue", "Automating international admissions entirely", "Replacing universities with online courses"], 0, "That's our vision statement, word for word. It's meant to be quoted, not paraphrased."],
    ["By what year is MSM Unify aiming to empower 5 million learners?", ["2026", "2028", "2030", "2032"], 1, "2028 is the target year for the 5-million-learner mission."],
    ["Which of these is NOT one of MSM Unify's core values?", ["Purpose", "Frugality", "Perfection", "Agility"], 2, "Our values are Purpose, Integrity, Impact, Agility, Frugality, Collaboration, and People, not 'Perfection'."],
    ["What is MSM Unify's platform, in one line?", ["A SaaS platform connecting agents with institutions to streamline student applications", "A university ranking website", "A visa processing service", "A student loan provider"], 0, "MSM Unify is the SaaS layer connecting agents and institutions worldwide."],
    ["What is the approved MSM Unify tagline used across marketing?", ["Global Education, Building Careers", "Learn Anything, Anywhere", "The Future of Universities", "Study Smarter, Not Harder"], 0, "'Global Education, Building Careers' is the approved tagline."],
  ];
  await Promise.all(
    missionQs.map(([question, options, correctIndex, explanation], i) =>
      prisma.quizQuestion.create({
        data: { moduleId: missionQuiz.id, question, options: JSON.stringify(options), correctIndex, explanation, order: i },
      })
    )
  );

  const verticalVideo = await prisma.module.create({
    data: {
      slug: "your-vertical-explained",
      type: "VIDEO",
      title: "Your Vertical, Explained",
      subtitle: "A short walkthrough of how your team fits the bigger picture",
      track: "FOUNDATION",
      day: 8,
      order: 1,
      body: "A leader from your function walks through what your vertical owns, how it's measured, and where it plugs into the 5-million-learner mission.",
      videoIsPlaceholder: true,
    },
  });

  const numbersQuiz = await prisma.module.create({
    data: {
      slug: "msm-unify-by-the-numbers",
      type: "QUIZ",
      title: "MSM Unify by the Numbers",
      subtitle: "Test what stuck from the world map",
      track: "FOUNDATION",
      day: 15,
      order: 1,
      body: "Go back to the map if you need a refresher. 80% clears the badge.",
      passThreshold: 80,
    },
  });
  const numberQs: Array<[string, string[], number, string]> = [
    ["Roughly how many countries does MSM Unify operate across?", ["10+", "30+", "75+", "150+"], 1, "30+ countries is our current stated footprint."],
    ["Roughly how many partner institutions work with MSM Unify?", ["50+", "150+", "400+", "1,000+"], 2, "400+ partner institutions worldwide."],
    ["Roughly how many channel partners does MSM Unify work with?", ["600+", "2,000+", "6,000+", "20,000+"], 2, "6,000+ channel partners globally."],
    ["Roughly how many lives has MSM Unify impacted to date?", ["100,000+", "500,000+", "1,000,000+", "5,000,000+"], 2, "1 million+ lives impacted so far, with 5 million as the 2028 target."],
  ];
  await Promise.all(
    numberQs.map(([question, options, correctIndex, explanation], i) =>
      prisma.quizQuestion.create({
        data: { moduleId: numbersQuiz.id, question, options: JSON.stringify(options), correctIndex, explanation, order: i },
      })
    )
  );

  const midCheckin = await prisma.module.create({
    data: {
      slug: "before-you-go",
      type: "CHECKLIST",
      title: "Before You Go",
      subtitle: "The setup that makes tomorrow easy",
      track: "FOUNDATION",
      day: 21,
      order: 1,
      body: "Work through this live with your manager or buddy before you close the session out.",
    },
  });
  const midItems = [
    ["Tools and access confirmed", "Email, Slack, and your core work systems are logged in and working."],
    ["Desk and equipment set up", "Laptop, monitor, and anything else you need are ready to go."],
    ["30-day check-in scheduled", "Get a slot on the calendar with your manager for a month from now."],
  ];
  await Promise.all(
    midItems.map(([label, helper], i) =>
      prisma.checklistItem.create({ data: { moduleId: midCheckin.id, label, helper, order: i } })
    )
  );

  const foundationReflection = await prisma.module.create({
    data: {
      slug: "session-reflection",
      type: "REFLECTION",
      title: "Session Reflection",
      subtitle: "Close out your Foundation Track",
      track: "FOUNDATION",
      day: 30,
      order: 1,
      body: "Your honest answers here shape how we onboard the next cohort. Completing this issues your certificate.",
    },
  });
  const foundationReflectionQs = [
    "What's one thing about MSM Unify that surprised you today?",
    "Which part of today felt most useful, and which part dragged?",
    "What would you tell someone starting here next week?",
  ];
  await Promise.all(
    foundationReflectionQs.map((prompt, i) =>
      prisma.reflectionQuestion.create({ data: { moduleId: foundationReflection.id, prompt, order: i } })
    )
  );

  const brandBriefing = await prisma.module.create({
    data: {
      slug: "brand-architecture-market-position",
      type: "BRIEFING",
      title: "Brand Architecture & Market Position",
      subtitle: "How Laul Global's House of Brands actually works",
      track: "LEADERSHIP",
      day: 1,
      order: 1,
      body: "MSM Unify sits inside Laul Global, an education group operating as a house of brands: MSM Unify, MSM Grad, Florida Coastal University, Career Banale, Staff UNO, Extreme Pro, Taylor Pro, Q Academy, Multihexa, ETON College, and Velric. Each brand keeps its own identity, market, and audience. The parent group stays in the background in every external communication.\n\nAs a Director+ leader, you're expected to know where your brand sits in that architecture, which brands you can and can't reference together, and why we protect that separation. Co-branded materials always run MSM Unify's logo on the left with a vertical divider before any partner mark. Career Banale runs 'Powered by MSM Unify' only on enrollment and agreement documents, nowhere else.\n\nMarket position: MSM Unify is the flagship, the SaaS layer connecting agents to institutions worldwide. Your job is to know how your function's decisions ladder up to that position, not just your own team's metrics.",
      quoteText: "Each brand maintains its own identity, market positioning, and audience. Never mix group brands in external communications.",
      quoteAuthor: "Brand Guide, Laul Global",
    },
  });

  const portfolioBriefing = await prisma.module.create({
    data: {
      slug: "portfolio-strategy",
      type: "BRIEFING",
      title: "Portfolio Strategy: The House of Brands",
      subtitle: "Why we run eleven brands instead of one",
      track: "LEADERSHIP",
      day: 1,
      order: 2,
      body: "A single monolithic brand can't credibly serve a driver-training business, a doctoral university, and a healthcare staffing agency at once. The house-of-brands model lets each business optimize for its own market while the group shares infrastructure, capital discipline, and operating talent behind the scenes.\n\nAs a leader, you'll be pulled toward 'why don't we just use the MSM Unify name everywhere' conversations. The answer is always market fit: Extreme Pro's driver-training audience does not want to hear about international student recruitment, and vice versa. Protecting that separation is not bureaucracy. It's how each brand earns trust with its own audience.\n\nYour strategic job: know which brands compete for the same budget internally, which ones feed each other's pipeline (e.g. MSM Grad into MSM Unify), and where frugality means sharing a capability rather than building a new one per brand.",
    },
  });

  const leadershipQuiz = await prisma.module.create({
    data: {
      slug: "leadership-readiness-check",
      type: "QUIZ",
      title: "Leadership Readiness Check",
      subtitle: "Brand architecture and market position, tested",
      track: "LEADERSHIP",
      day: 1,
      order: 3,
      body: "80% clears the badge. This one draws directly from the two briefings above.",
      passThreshold: 80,
    },
  });
  const leadershipQs: Array<[string, string[], number, string]> = [
    ["What sits above MSM Unify in the corporate structure?", ["Laul Global, an Education Group operating as a House of Brands", "M Square Media Holdings Inc.", "Nothing, MSM Unify is the parent company", "A public holding company"], 0, "Laul Global is the parent House of Brands; it stays in the background externally."],
    ["Where should 'Powered by MSM Unify' appear for Career Banale?", ["On every page of the website", "Only on enrollment brochures and agreement copy", "Never, the brands must stay fully separate", "Only in press releases"], 1, "It's scoped narrowly to enrollment/agreement documents only."],
    ["In co-branded materials, where does the MSM Unify logo go?", ["Right side, no divider", "Left side, with a vertical divider before the partner logo", "Centered above the partner logo", "Bottom footer only"], 1, "MSM Unify logo left, partner logo right, vertical divider between them."],
    ["Why does MSM Unify run a house-of-brands model instead of one master brand?", ["It's cheaper to register more domains", "Each business needs to earn trust with a distinct audience it wouldn't reach under one name", "Regulatory requirements force it", "It was inherited from an acquisition"], 1, "Market fit. A single brand can't credibly serve driver training and doctoral education at once."],
  ];
  await Promise.all(
    leadershipQs.map(([question, options, correctIndex, explanation], i) =>
      prisma.quizQuestion.create({
        data: { moduleId: leadershipQuiz.id, question, options: JSON.stringify(options), correctIndex, explanation, order: i },
      })
    )
  );

  const leadershipReflection = await prisma.module.create({
    data: {
      slug: "session-reflection-leadership",
      type: "REFLECTION",
      title: "Session Reflection",
      subtitle: "Close out your Leadership Track",
      track: "LEADERSHIP",
      day: 1,
      order: 4,
      body: "Completing this issues your certificate.",
    },
  });
  const leadershipReflectionQs = [
    "What's one decision you'll make differently now that you understand the brand architecture?",
    "Where do you expect the ownership-mindset culture here to be hardest to instill in your team?",
    "What's the one thing you wish someone had told you before today?",
  ];
  await Promise.all(
    leadershipReflectionQs.map((prompt, i) =>
      prisma.reflectionQuestion.create({ data: { moduleId: leadershipReflection.id, prompt, order: i } })
    )
  );

  console.log("Simulating progress for sample users...");

  async function complete(userId: string, moduleId: string, daysBack: number) {
    await prisma.progress.create({
      data: { userId, moduleId, status: "COMPLETE", completedAt: daysAgo(daysBack), updatedAt: daysAgo(daysBack) },
    });
  }
  async function inProgress(userId: string, moduleId: string) {
    await prisma.progress.create({ data: { userId, moduleId, status: "IN_PROGRESS" } });
  }
  async function checklistDone(userId: string, moduleId: string) {
    const items = await prisma.checklistItem.findMany({ where: { moduleId } });
    await Promise.all(
      items.map((it) => prisma.checklistCompletion.create({ data: { userId, itemId: it.id, completedWith: "Live session" } }))
    );
    await complete(userId, moduleId, 1);
  }
  async function quizPass(userId: string, moduleId: string, scorePct: number) {
    await prisma.quizAttempt.create({ data: { userId, moduleId, scorePct, passed: scorePct >= 80 } });
    if (scorePct >= 80) await complete(userId, moduleId, 1);
    else await inProgress(userId, moduleId);
  }

  // Priya - day 4, early progress
  await complete(priya.id, welcomeVideo.id, 4);
  await complete(priya.id, mapModule.id, 4);
  await checklistDone(priya.id, meetYourPeople.id);

  // Fatima - day 9
  await complete(fatima.id, welcomeVideo.id, 9);
  await complete(fatima.id, mapModule.id, 9);
  await checklistDone(fatima.id, meetYourPeople.id);
  await quizPass(fatima.id, missionQuiz.id, 100);

  // Amara - day 14
  await complete(amara.id, welcomeVideo.id, 14);
  await complete(amara.id, mapModule.id, 14);
  await checklistDone(amara.id, meetYourPeople.id);
  await quizPass(amara.id, missionQuiz.id, 80);
  await complete(amara.id, verticalVideo.id, 6);
  await quizPass(amara.id, numbersQuiz.id, 60);

  // Wei - day 28, almost done
  await complete(wei.id, welcomeVideo.id, 28);
  await complete(wei.id, mapModule.id, 28);
  await checklistDone(wei.id, meetYourPeople.id);
  await quizPass(wei.id, missionQuiz.id, 100);
  await complete(wei.id, verticalVideo.id, 20);
  await quizPass(wei.id, numbersQuiz.id, 100);
  await checklistDone(wei.id, midCheckin.id);

  // Jonas - day 35, track complete + certificate
  await complete(jonas.id, welcomeVideo.id, 35);
  await complete(jonas.id, mapModule.id, 35);
  await checklistDone(jonas.id, meetYourPeople.id);
  await quizPass(jonas.id, missionQuiz.id, 100);
  await complete(jonas.id, verticalVideo.id, 27);
  await quizPass(jonas.id, numbersQuiz.id, 100);
  await checklistDone(jonas.id, midCheckin.id);
  await complete(jonas.id, foundationReflection.id, 5);
  await prisma.reflection.create({
    data: {
      userId: jonas.id,
      moduleId: foundationReflection.id,
      answers: JSON.stringify([
        { question: foundationReflectionQs[0], answer: "How fast decisions actually move here compared to my last company." },
        { question: foundationReflectionQs[1], answer: "Most supported in my 1:1s; most on my own figuring out our internal tools." },
        { question: foundationReflectionQs[2], answer: "Say yes to the buddy session. It answers the questions you won't ask your manager." },
      ]),
      npsScore: 9,
      createdAt: daysAgo(5),
    },
  });
  await prisma.certificate.create({
    data: { userId: jonas.id, track: "FOUNDATION", slug: "jonas-berg-demo-cert", issuedAt: daysAgo(5) },
  });

  // Diego - day 0, nothing started yet (fresh joiner state)

  // Meera (leadership), partway through
  await complete(meera.id, welcomeVideo.id, 10);
  await complete(meera.id, mapModule.id, 10);
  await checklistDone(meera.id, meetYourPeople.id);
  await complete(meera.id, brandBriefing.id, 6);
  await complete(meera.id, portfolioBriefing.id, 4);
  await quizPass(meera.id, leadershipQuiz.id, 100);

  console.log("Seed complete.");
  console.log(`Admin login: ${admin.name} (${admin.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
