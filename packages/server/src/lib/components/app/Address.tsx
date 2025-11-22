import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { copyToClipboard } from "@/utils";
import { truncateAddress } from "../../utils";
import Icon from "../custom/Icon";
import { Button } from "../ui/button";

export default function Address() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  return (
    <div className="text-sm text-muted-foreground flex justify-center items-center gap-2">
      <p>Your Address: {truncateAddress(walletAddress || "", 14)}</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (!walletAddress) {
            toast.error("No wallet address found");
            return;
          }
          copyToClipboard(walletAddress, "Wallet Address");
        }}
      >
        <Icon name="Copy" className="size-4" />
      </Button>
    </div>
  );
}
