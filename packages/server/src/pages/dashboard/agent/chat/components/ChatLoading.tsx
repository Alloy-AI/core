import Icon from "@/src/lib/components/custom/Icon";

export default function ChatLoading() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[80%] border border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Bot" className="size-3 text-primary" />
          </div>
          <div className="flex items-center gap-1 mt-1 mx-1">
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
