// Selected catalog: original order, routes and assets preserved.
export const projects=[
  {
    "id": "masthead",
    "name": "Masthead",
    "category": "AI systems",
    "description": "The Workbench, drawing from Masthead's local record of coding-agent sessions, is where you write useful pages from the raw history. Keeping the conversation and keeping the answer are separate steps: reviewed pages go into the Local Logbook, where people and agents can find them again through read-only retrieval.",
    "url": "https://usemasthead.com",
    "image": "assets/projects/Masthead.webp",
    "imageAlt": "Masthead product art: the work is still there — keeps the record",
    "mark": "M",
    "color": "#94bde8",
    "role": null
  },
  {
    "id": "chartstead",
    "name": "ChartStead",
    "category": "Conference programming",
    "description": "A reviewable plan before an action reaches speakers or the audience. (Unfinished work stays visible while organizers put the program together.) Proposals, review, speakers, scheduling and a public agenda, connected by ChartStead. Keep asking, as I did: what is about to happen, and who will it affect?",
    "url": "https://chartstead.com",
    "image": "assets/projects/Chartstead.webp",
    "imageAlt": "ChartStead product showcase: publish a program you trust, with agenda readiness and fictional sample data",
    "mark": "CS",
    "color": "#d0b97d",
    "role": null
  },
  {
    "id": "pip",
    "name": "Pip",
    "category": "Finance workflow",
    "description": "Around Spendable Cash Today, Pip builds a read-only conversation. A bank balance can include money already needed for something else. On the web and Android, that's the experience the project explores. With the application calculating the facts and the agent explaining them, financial logic stays in inspectable code.",
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
    "description": "A conflict explained, the last valid plan kept, and an exportable room-by-room deep-clean schedule when the work fits: Hotel Cleaning Schedule works from rooms, cleaning capacity, dates and blackouts. The calendar has to be something the team can actually carry out.",
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
    "description": "Grew into an application and open-source release.\n\nFrom a brain dump, proposed outcomes, steps and a schedule, with capacity and constraints included. Originally, for my own planning. Before committing, a plan to review; at the end, every outcome either executed or abandoned.",
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
    "description": "In the actual outputs, you can compare composition, typography and interpretation. That's MILK Bench. Give coding models the same frozen brief for a prestigious whole-milk launch website, then keep what they make. Compare one playful assignment, with no claim to settle which model is best at everything.",
    "url": "https://milk.animasai.co/",
    "image": "assets/projects/Milkbench.webp",
    "imageAlt": "Milkbench visual with a milk pour, model names, and Luna, Terra, and Sol results.",
    "mark": "MB",
    "color": "#e5d2b0",
    "role": null
  },
  {
    "id": "wargus-typescript",
    "name": "Wargus TypeScript",
    "category": "Browser RTS",
    "description": "From a broad port to one Garden of War match against the computer: gather, build, train and fight. The original project destination, still linked here. Read the scope decision and upstream credits in Notes.\n\nBuilt around Warcraft II-derived play and Wargus/Stratagus, this was an earlier browser RTS project.",
    "url": "https://wargus.animasai.co",
    "image": "assets/projects/Wargus.webp",
    "imageAlt": "Wargus TypeScript: classic RTS in the browser, Garden of War human vs CPU",
    "mark": "W",
    "color": "#b0bc83",
    "role": null
  },
  {
    "id": "rat-detective-online",
    "name": "Rat Detective Online",
    "category": "Creative web",
    "description": "With networking and physics supporting a shared world, Rat Detective Online is a multiplayer browser shooter: detective rats, bouncing cheese balls, a run-down city.\n\nFrom a silly Three.js prototype came interiors, sewers, hazards and server-owned AI opponents. Within that noir setting, plenty of room for physical comedy.",
    "url": "https://rat-detective.animasai.co",
    "image": "assets/projects/RatDetective.webp",
    "imageAlt": "Rat Detective: City Under Siege title screen",
    "mark": "RD",
    "color": "#d59d7c",
    "role": null
  },
  {
    "id": "helm",
    "name": "Helm",
    "category": "Work in progress",
    "description": "Helm, a persistent Android assistant project with goals, tasks and evidence beyond a single chat. The underlying story, in Notes. While the system is unfinished, these studio interactions stay inside the demonstration. Try the Tokyo Night handset beside the laptop — a visual preview of the idea.",
    "url": null,
    "route": "#desk/helm",
    "image": "assets/projects/Helm.webp",
    "imageAlt": "Helm phone: interactive studio preview",
    "mark": "H",
    "color": "#91b8dd",
    "role": null
  },
  {
    "id": "chartroom",
    "name": "Chartroom",
    "category": "Open-source knowledge tools",
    "description": "A local second brain built on GBrain, with TypeSafe Jev helping rank searches and suggest connections between pages. Chartroom keeps the evidence and change history inspectable. The working preview runs through MCP and the command line; its small synthetic comparison and limitations are in the repository.",
    "url": "https://github.com/MayberryDT/chartroom",
    "image": "assets/projects/Chartroom.webp",
    "imageAlt": "Concept illustration of connected knowledge pages in Chartroom",
    "mark": "CR",
    "color": "#a7c5bd",
    "role": null
  }
];
export const projectById=new Map(projects.map(project=>[project.id,project]));
