import { Link } from "@tanstack/react-router";
import { Bot, MessageSquare, Plus, Search } from "lucide-react";
import { useState } from "react";
import Icon from "@/src/lib/components/custom/Icon";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import { Input } from "@/src/lib/components/ui/input";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";

export default function ChatList() {
  const [searchQuery, setSearchQuery] = useState("");
  const haithe = useHaitheApi();
  const { selectedOrg } = useStore();

  // Get agents data
  const agentsQuery = haithe.getProjects(Number(selectedOrg?.id));

  const filteredAgents =
    agentsQuery.data?.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (agentsQuery.isPending) {
    return (
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Chat with Agents</h1>
          <p className="text-muted-foreground">
            Start a conversation with your AI agents
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/agents">
            <Plus className="size-4 mr-2" />
            Create Agent
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No agents found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first agent to get started"}
            </p>
          </div>
          {!searchQuery && (
            <Button asChild>
              <Link to="/dashboard/agents">
                <Plus className="size-4 mr-2" />
                Create Agent
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <Link to={`/dashboard/agents/${agent.id}/chat`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2 mb-4">
                    {agent.description || "No description available"}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Ready to chat</span>
                    <Icon name="ArrowRight" className="size-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
