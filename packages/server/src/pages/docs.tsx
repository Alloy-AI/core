import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center space-y-4">
      <h1 className="text-4xl font-bold text-white">Documentation</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Documentation is coming soon. This is a mock placeholder page.
      </p>
      <Button variant="outline" asChild>
        <Link to="/">
          <ArrowLeftIcon className="mr-2 size-4" />
          Back Home
        </Link>
      </Button>
    </div>
  );
}
