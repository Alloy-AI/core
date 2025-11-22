import { CpuIcon, PlusIcon, RobotIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent } from "@/src/lib/components/ui/card";
import { mockAgents } from "@/src/lib/mock";
import Layout from "./layout";

export default function AgentsPage() {
  const agents = mockAgents;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
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

        {/* Agents Grid */}
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
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          agent.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-chart-2/10 text-chart-2 border-chart-2/20"
                        }`}
                      >
                        {agent.isActive ? "Active" : "Idle"}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {agent.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {/* Placeholder for future metadata if needed */}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CpuIcon className="size-3" />
                        {agent.version}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
