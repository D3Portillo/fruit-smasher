import { shuffleArray } from "./arrays"

export type MonsterTypes = "pineapple" | "orange"

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

  if (type === "orange") {
    return shuffleArray([
      "Citrus Itsy Bitsy",
      "The Notorious C.",
      "O.U-Glad I'm Not Dead",
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
