export type CropId =
  | "wheat"
  | "rice"
  | "cotton"
  | "sugarcane"
  | "maize"
  | "mango"
  | "citrus"
  | "tomato"
  | "potato"
  | "chili";

export type Crop = {
  id: CropId;
  name: string;
  emoji: string;
  season: "rabi" | "kharif" | "perennial";
  commonDiseases: string[];
  zones: string[];
};

export const CROPS: Crop[] = [
  {
    id: "wheat",
    name: "Wheat",
    emoji: "🌾",
    season: "rabi",
    commonDiseases: ["Yellow rust", "Leaf rust", "Karnal bunt", "Loose smut", "Powdery mildew"],
    zones: ["Punjab", "Sindh", "KP"]
  },
  {
    id: "rice",
    name: "Rice (Basmati)",
    emoji: "🍚",
    season: "kharif",
    commonDiseases: ["Blast", "Bacterial leaf blight", "Sheath blight", "Brown spot"],
    zones: ["Punjab", "Sindh"]
  },
  {
    id: "cotton",
    name: "Cotton",
    emoji: "🪴",
    season: "kharif",
    commonDiseases: ["Cotton leaf curl virus", "Bacterial blight", "Pink bollworm", "Whitefly damage"],
    zones: ["Punjab", "Sindh"]
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    emoji: "🎋",
    season: "perennial",
    commonDiseases: ["Red rot", "Smut", "Pyrilla", "Top borer"],
    zones: ["Punjab", "Sindh", "KP"]
  },
  {
    id: "maize",
    name: "Maize",
    emoji: "🌽",
    season: "kharif",
    commonDiseases: ["Maize streak", "Stalk rot", "Northern leaf blight", "Fall armyworm"],
    zones: ["Punjab", "KP"]
  },
  {
    id: "mango",
    name: "Mango",
    emoji: "🥭",
    season: "perennial",
    commonDiseases: ["Anthracnose", "Mango malformation", "Powdery mildew", "Mealybug"],
    zones: ["Sindh", "Punjab"]
  },
  {
    id: "citrus",
    name: "Citrus (Kinnow)",
    emoji: "🍊",
    season: "perennial",
    commonDiseases: ["Citrus canker", "Citrus greening (HLB)", "Gummosis", "Leaf miner"],
    zones: ["Punjab"]
  },
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    season: "kharif",
    commonDiseases: ["Early blight", "Late blight", "Leaf curl virus", "Bacterial wilt"],
    zones: ["Punjab", "Sindh", "KP"]
  },
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    season: "rabi",
    commonDiseases: ["Late blight", "Early blight", "Black scurf", "Common scab"],
    zones: ["Punjab", "KP", "GB"]
  },
  {
    id: "chili",
    name: "Chili",
    emoji: "🌶️",
    season: "kharif",
    commonDiseases: ["Fruit rot (anthracnose)", "Leaf curl", "Powdery mildew", "Thrips"],
    zones: ["Sindh", "Punjab"]
  }
];

export function getCrop(id: string): Crop | undefined {
  return CROPS.find((c) => c.id === id);
}
