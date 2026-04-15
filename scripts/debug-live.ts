import { getJupiterPrice, getPythPrice } from "@arbinexus/sdk";

async function main() {
  const pyth = await getPythPrice("SOL");
  const jupiter = await getJupiterPrice("SOL", "USDC");

  console.log("pyth", pyth);
  console.log("jupiter", jupiter);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
