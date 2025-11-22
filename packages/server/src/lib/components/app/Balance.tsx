import { useBalance } from "wagmi";
import { cn } from "../../utils";
import { Button } from "../ui/button";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import definitions from "services/definitions";

export default function Balance({ address }: { address?: `0x${string}` }) {
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address;
    const addressToUse = address ? address : walletAddress ? walletAddress : undefined;

    const USDT_ADDRESS = definitions.tUSDT.address;

    const METISBalance = useBalance({
        address: addressToUse as `0x${string}`,
    })

    const USDTBalance = useBalance({
        address: addressToUse as `0x${string}`,
        token: USDT_ADDRESS as `0x${string}`,
    })

    if (!METISBalance.data || !USDTBalance.data) {
        return null;
    }

    return (
        <div className="text-sm text-muted-foreground flex justify-center items-center px-4 gap-x-4">
            <div className="flex justify-center items-center">
                <p>TMETIS: {formatEther(METISBalance?.data?.value ? METISBalance.data.value : 0n)}</p>
                <Button variant="ghost" size="icon" onClick={() => METISBalance.refetch()}>
                    <Icon name="RefreshCcw" className={cn(
                        "size-4",
                        METISBalance.isFetching ? "animate-spin" : ""
                    )} />
                </Button>
            </div>
            <div className="flex justify-center items-center">
                <p>USDT: {formatEther(USDTBalance?.data?.value ? USDTBalance.data.value : 0n)}</p>
                <Button variant="ghost" size="icon" onClick={() => USDTBalance.refetch()}>
                    <Icon name="RefreshCcw" className={cn(
                        "size-4",
                        USDTBalance.isFetching ? "animate-spin" : ""
                    )} />
                </Button>
            </div>
        </div>
    )
}