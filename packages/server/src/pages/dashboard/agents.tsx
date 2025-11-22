import { useState } from "react";
import Layout from "./layout";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Link } from "@tanstack/react-router";
import { 
  RobotIcon, 
  PlusIcon,
  CpuIcon
} from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils";

export default function AgentsPage() {
    // Mock data - usually fetched from API
    const agents = [
        { name: "Trading Bot Alpha", status: "Active", version: "v1.2.0", description: "High-frequency trading algorithm focused on ETH pairs." },
        { name: "Support Agent v2", status: "Idle", version: "v2.0.1", description: "Customer service bot handling tier 1 support queries." },
        { name: "Data Scraper X", status: "Active", version: "v1.0.0", description: "Aggregates market sentiment data from social media." },
        { name: "Arbitrage Bot", status: "Active", version: "v3.1.0", description: "Scans DEXs for price discrepancies." },
        { name: "Content Gen AI", status: "Paused", version: "v0.9.5", description: "Generates daily market analysis reports." },
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">My Agents</h1>
                        <p className="text-muted-foreground">Manage and monitor your autonomous agent fleet.</p>
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
                    {agents.map((agent, i) => (
                        <Card key={i} className="bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/5 transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center shrink-0">
                                            <RobotIcon className="size-6 text-primary" weight="fill" />
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                            agent.status === "Active" 
                                                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                                : agent.status === "Idle" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                            {agent.status}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors">
                                                {agent.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
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
                    ))}
                </div>
            </div>
        </Layout>
    );
}
