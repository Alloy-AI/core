import {
	createConfig,
	WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";
import { filecoinCalibration, hardhat } from "viem/chains";
import { http } from "wagmi";

declare module "wagmi" {
	interface Register {
		config: ReturnType<typeof createConfig>;
	}
}

export function WagmiProvider({ children }: { children: React.ReactNode }) {
	const runtimeChain =
		process.env.BUN_PUBLIC_RUNTIME_CHAIN_ID === "314159"
			? filecoinCalibration
			: hardhat;

	const config = createConfig({
		chains: [runtimeChain],
		transports: {
			31337: http(),
			314159: http(),
		},
	});

	return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}
