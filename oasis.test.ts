import axios from "axios";

const server = "0x361cC24489DA702BFc57c49357AE5151F65CB464";

async function main() {
  const api = axios.create({
    baseURL: "https://p3000.m1137.opf-testnet-rofl-25.rofl.app",
    headers: {
      Authorization: "Bearer 0x470AEf46CEB329075D92a9874977BBF44Fc9D28c",
      "Content-Type": "application/json",
    },
  });

  const teeWallet = api.get("/evm-address");
  console.log("Tee Wallet Address:", (await teeWallet).data);

  const agentCreationResponse = await api.post("/agents", {
    name: "Test Agent",
    description: "An agent for testing purposes",
    model: "openai/gpt-oss-120b",
    baseSystemPrompt: "You are a helpful assistant.",
    chains: [11155111],
  });

  console.log("Agent Creation Response:", agentCreationResponse.data);

  const agentId = agentCreationResponse.data.data.agentId;

  const messageResponse = await api.post("/agents/message", {
    agentId,
    message: "Hello, how can you assist me today?",
  });

  console.log("Message Response:", messageResponse.data);
}

main();
