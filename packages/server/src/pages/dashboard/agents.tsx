import { CpuIcon, PlusIcon, RobotIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent } from "@/src/lib/components/ui/card";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { useAgents } from "@/src/lib/hooks/use-api";
import Layout from "./layout";

export default function AgentsPage() {
  const { data: agents, isLoading, isError, error } = useAgents();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              My Agents
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your autonomous agent fleet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" asChild>
              <Link to="/dashboard/create-agent">
                <PlusIcon className="size-4" weight="bold" />
                New Agent
              </Link>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="bg-destructive/10 border-destructive/50">
            <CardContent className="p-6">
              <p className="text-destructive">
                Error loading agents: {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Agents Grid */}
        {!isLoading && !isError && agents && agents.length > 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                to="/dashboard/agent/$agentId"
                params={{ agentId: agent.id }}
                className="block h-full"
              >
                <Card className="bg-background/40 backdrop-blur-md border-border hover:bg-muted/20 transition-all cursor-pointer group h-full">
                  <CardContent className="p-6 h-full">
                    <div className="flex flex-col gap-4 h-full">
                      <div className="flex justify-between items-start w-full">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center shrink-0">
                          <RobotIcon
                            className="size-6 text-primary"
                            weight="fill"
                          />
                        </div>
                        <div className="px-2 py-1 rounded-full text-xs font-medium border bg-muted/10 text-muted-foreground border-border">
                          {agent.model || "No Model"}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {agent.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {agent.description || "No description"}
                        </p>
                      </div>

                      <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {agent.tools?.length || 0} tools
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CpuIcon className="size-3" />
                          {agent.model || "N/A"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!agents || agents.length === 0) && (
          <Card className="bg-background/40 backdrop-blur-md border-border">
            <CardContent className="p-12 text-center">
              <RobotIcon className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No agents found
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first agent to get started.
              </p>
              <Button variant="primary" asChild>
                <Link to="/dashboard/create-agent">
                  <PlusIcon className="size-4" weight="bold" />
                  Create Agent
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
