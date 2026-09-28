// Selected catalog: routes and assets preserved; order set by Tyler 2026-09-28; Decree of War removed for now at his request.
export const projects=[
  {
    "id": "ibara",
    "name": "ibara",
    "category": "Agent computers",
    "description": "ibara gives AI agents computers of their own: they use the browser and desktop apps there while you keep working on yours. Any agent that speaks MCP can drive it.\n\nI built it on Omarchy, where it runs today; more platforms are on the way. Watch it at work on the portrait monitor beside the laptop. My company, Animas, sets it up for people who want it handled.",
    "url": "https://ibara.app",
    "image": "assets/projects/ibara.webp",
    "imageAlt": "ibara: give your agents a computer you own",
    "mark": "ib",
    "color": "#8fc3d9",
    "role": null
  },
  {
    "id": "rat-detective-online",
    "name": "Rat Detective Online",
    "category": "Creative web",
    "description": "A multiplayer browser shooter where detective rats throw bouncing cheese balls across a run-down noir city.\n\nIt started as a silly Three.js prototype and grew into streets, interiors, sewers, hazards and server-run AI opponents. The rule I keep: physical comedy stays at the center, and the atmosphere and networking are there to support it.",
    "url": "https://ratdetective.online",
    "image": "assets/projects/RatDetective.webp",
    "imageAlt": "Rat Detective: a detective rat running through a noir alley during a cheese gunfight",
    "mark": "RD",
    "color": "#d59d7c",
    "role": null
  },
  {
    "id": "chartroom",
    "name": "Chartroom",
    "category": "Open-source knowledge tools",
    "description": "A local second brain built on GBrain, with TypeSafe Jev helping rank searches and suggest connections between pages. Evidence and change history stay inspectable.\n\nIt's a working preview that runs through MCP and the command line. The small synthetic comparison and its limits are in the repository.",
    "url": "https://github.com/MayberryDT/chartroom",
    "image": "assets/projects/Chartroom.webp",
    "imageAlt": "Concept illustration of connected knowledge pages in Chartroom",
    "mark": "CR",
    "color": "#a7c5bd",
    "role": null
  },
  {
    "id": "chartstead",
    "name": "ChartStead",
    "category": "Conference programming",
    "description": "Conference programming and speaker management: proposals, review, speakers, scheduling and the public agenda, connected in one place.\n\nI built it around one question: before an organizer acts, what is about to happen, and who will it affect? Unfinished work stays visible, and anything that reaches speakers or the audience is shown for review first. Live site, sample-data demo and MIT-licensed source.",
    "url": "https://chartstead.com",
    "image": "assets/projects/Chartstead.webp",
    "imageAlt": "ChartStead product showcase: publish a program you trust, with agenda readiness and fictional sample data",
    "mark": "CS",
    "color": "#d0b97d",
    "role": null
  },
  {
    "id": "masthead",
    "name": "Masthead",
    "category": "AI systems",
    "description": "Masthead keeps a local record of your coding-agent sessions and helps you turn the useful parts into pages.\n\nIn the Workbench you write a reviewed page from the raw history. Reviewed pages go into the Local Logbook, where people and agents can find them again through read-only retrieval. The idea: keep the whole record, but start the next session from a reviewed explanation, not a transcript.",
    "url": "https://usemasthead.com",
    "image": "assets/projects/Masthead.webp",
    "imageAlt": "Masthead product art: the work is still there — keeps the record",
    "mark": "M",
    "color": "#94bde8",
    "role": null
  },
  {
    "id": "pip",
    "name": "Pip",
    "category": "Finance workflow",
    "description": "A spending companion built around one number: Spendable Cash Today. A bank balance can include money already promised to upcoming bills; Pip shows what's actually free to spend, on the web and Android.\n\nThe application does the arithmetic in inspectable code, from read-only account data. The agent explains it, and never makes up the numbers.",
    "url": "https://spendwithpip.com",
    "image": "assets/projects/Pip.webp",
    "imageAlt": "Pip product preview",
    "mark": "P",
    "color": "#b5ccb1",
    "role": null
  },
  {
    "id": "hotel-cleaning-schedule",
    "name": "Hotel Cleaning Schedule",
    "category": "Hospitality ops",
    "description": "Builds a room-by-room deep-clean calendar from rooms, cleaning capacity, dates and blackouts, and exports it when the work fits.\n\nA calendar can look convincing while asking a team to do the impossible. So when the work won't fit, it says why and keeps the last plan that worked.",
    "url": "https://hotelcleaningschedule.com",
    "image": "assets/projects/HotelCleaningSchedule.webp",
    "imageAlt": "Hotel Cleaning Schedule product showcase with deep-clean calendar UI and validated schedule",
    "mark": "HC",
    "color": "#9fbcc7",
    "role": null
  },
  {
    "id": "executioner",
    "name": "Executioner",
    "category": "Execution",
    "description": "A planner that turns a brain dump into outcomes, steps and a schedule that respects your capacity and constraints.\n\nI started it when writing everything down still didn't tell me what to do with a day. The schedule stays a proposal until you review it, and every outcome ends as done or deliberately abandoned. It grew into an application and an open-source release.",
    "url": "https://executionr.com",
    "image": "assets/projects/Executioner.webp",
    "imageAlt": "Executioner logo",
    "mark": "EX",
    "color": "#baabc6",
    "role": null
  },
  {
    "id": "milkbench",
    "name": "Milkbench",
    "category": "AI evaluation",
    "description": "A playful benchmark: coding models get the same frozen brief, a prestigious launch website for whole milk, and the gallery keeps what each one made.\n\nYou compare composition, typography and interpretation in the actual pages. Runs stay intact, and a changed prompt starts a new comparison. It's one playful assignment, not a claim about which model is best at everything.",
    "url": "https://milk.tylermayberry.dev/",
    "image": "assets/projects/Milkbench.webp",
    "imageAlt": "Milkbench visual with a milk pour, model names, and Luna, Terra, and Sol results.",
    "mark": "MB",
    "color": "#e5d2b0",
    "role": null
  },
  {
    "id": "helm",
    "name": "Helm",
    "category": "Work in progress",
    "description": "A persistent Android assistant I'm still building: goals, tasks, capabilities and evidence belong to the system, not to a single chat.\n\nThe system is unfinished. The Tokyo Night handset beside the laptop is an interactive visual preview; it doesn't connect to the assistant. The story so far is in Notes.",
    "url": null,
    "route": "#desk/helm",
    "image": "assets/projects/Helm.webp",
    "imageAlt": "Helm phone: interactive studio preview",
    "mark": "H",
    "color": "#91b8dd",
    "role": null
  }
];
export const projectById=new Map(projects.map(project=>[project.id,project]));
