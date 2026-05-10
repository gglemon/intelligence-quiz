// Each question contributes 0-4 points toward the "high intelligence" total.
// reversed: true means a HIGH agreement maps to a LOW intelligence score.

const QUESTIONS = [
  {
    id: 1,
    sign: "Overthinks everything",
    type: "yesno",
    text: "Do you overthink everything?",
    reversed: false,
  },
  {
    id: 2,
    sign: "Prefers deep conversations",
    type: "choice",
    text: "Which do you find more energizing?",
    options: [
      { label: "Deep, philosophical conversations", score: 4 },
      { label: "Light, easy small talk", score: 0 },
      { label: "A bit of both, depending on mood", score: 2 },
    ],
  },
  {
    id: 3,
    sign: "Hyper-aware of details",
    type: "scale",
    text: "I notice small details that other people miss.",
    leftLabel: "Strongly disagree",
    rightLabel: "Strongly agree",
    reversed: false,
  },
  {
    id: 4,
    sign: "Feels pressure to succeed",
    type: "scale",
    text: "I rarely feel pressure to be successful.",
    leftLabel: "Strongly disagree",
    rightLabel: "Strongly agree",
    reversed: true,
  },
  {
    id: 5,
    sign: "Gets bored easily",
    type: "scale",
    text: "How easily do you get bored?",
    leftLabel: "Almost never",
    rightLabel: "Constantly",
    reversed: false,
  },
  {
    id: 6,
    sign: "Questions everything",
    type: "choice",
    text: "When someone confidently states a 'fact,' your first instinct is to…",
    options: [
      { label: "Doubt it and dig in", score: 4 },
      { label: "Want to verify it later", score: 2 },
      { label: "Trust it and move on", score: 0 },
    ],
  },
  {
    id: 7,
    sign: "Struggles with perfectionism",
    type: "scale",
    text: "I'm fine turning in work that's just 'good enough.'",
    leftLabel: "Strongly disagree",
    rightLabel: "Strongly agree",
    reversed: true,
  },
  {
    id: 8,
    sign: "Emotionally heavy, deeply empathetic",
    type: "yesno",
    text: "Do other people's emotions affect you deeply?",
    reversed: false,
  },
];

const TIERS = [
  {
    min: 26,
    label: "Highly intelligent thinker",
    blurb: "All the signs are there. You think deeply, feel deeply, and notice what others walk past.",
  },
  {
    min: 18,
    label: "Above-average mind",
    blurb: "Strong intelligence indicators — with enough balance to actually function in the world.",
  },
  {
    min: 10,
    label: "Balanced thinker",
    blurb: "You think clearly without getting stuck in your head. That's harder than it looks.",
  },
  {
    min: 0,
    label: "Action-oriented",
    blurb: "You don't overanalyze — you do. That's its own kind of intelligence.",
  },
];

const SIGNS = [
  "Overthinks everything",
  "Prefers deep over surface-level conversations",
  "Too aware of everything",
  "Feels high pressure to succeed",
  "Gets bored easily",
  "Questions everything, even themselves",
  "Struggles with perfectionism",
  "Emotionally heavy, shows lots of empathy",
];
