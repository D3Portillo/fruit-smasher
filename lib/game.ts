import { shuffleArray } from "./arrays"

export type MonsterTypes = "pineapple" | "orange" | "watermelon" | "fresa"

export const getRandomMonsterName = (type: MonsterTypes) => {
  if (type === "pineapple") {
    return shuffleArray([
      "Sir Spiky McSpikerson",
      "Pineapple Pete",
      "T. Crown Catastrophe",
      "Spiky Da Savage Steve",
      "Prof. Pricklebottom",
      "Captain Crownhead",
      "The Spiked Menace",
      "Prickly Pete",
      "Lord Leafy McStabface",
      "The Spiky Kiddo",
    ]).at(0)!
  }

  if (type === "fresa") {
    return shuffleArray([
      "Berry Bad Bob",
      "Strawberry Slayer",
      "The Berry Bandit",
      "Cap. Berrylicious",
      "The BerrySmash",
      "The Berry Beast",
      "Berry Bonanza",
      "The Straw Boss",
      "Sir Strawbuckle",
    ]).at(0)!
  }

  if (type === "watermelon") {
    return shuffleArray([
      "Melon Madness",
      "Watermelon Warlord",
      "Melon is MaName",
      "The Juicier Jester",
      "Slice & Dice Sam",
      "Watermelon King",
      "Melonhead Mike",
      "The Rind Ripper",
      "Cap. Water Monster",
      "Da Melon Menace",
    ]).at(0)!
  }
  if (type === "orange") {
    return shuffleArray([
      "Citrus Itsy Bitsy",
      "The Notorious C.",
      "U. Glad I'm Not Dead",
      "Pete the Punisher",
      "The Zesty Zombie",
      "Cap. Citrus Chaos",
      "The Peeling Predator",
      "Tangerine Terror Tim",
      "T. Juicy Juggernaut",
      "Sir Segments-a-Lot",
    ]).at(0)!
  }

  return "The Big Monsta"
}
