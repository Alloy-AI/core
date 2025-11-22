import { truncateAddress } from "../../utils";
import { Button } from "../ui/button";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { copyToClipboard } from "@/utils";
import { toast } from "sonner";

export default function Address() {
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address;

    return (
        <div className="text-sm text-muted-foreground flex justify-center items-center gap-2">
            <p>Your Address: {truncateAddress(walletAddress || "", 14)}</p>
            <Button variant="ghost" size="icon" onClick={() => {
                if (!walletAddress) {
                    toast.error("No wallet address found");
                    return;
                }
                copyToClipboard(walletAddress, "Wallet Address");
            }}>
                <Icon name="Copy" className="size-4" />
            </Button>
        </div>
    )
}