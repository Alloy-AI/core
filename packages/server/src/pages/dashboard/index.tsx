import Layout from "./layout";
import { Link } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Image } from "@/src/lib/components/custom/Image";
import { PlusIcon, RobotIcon, PulseIcon, LightningIcon, FileTextIcon, UsersIcon, TrendUpIcon } from "@phosphor-icons/react";

export default function DashboardPage() {
    const agents = [
        { name: "Trading Bot Alpha", status: "Active" },
        { name: "Support Agent v2", status: "Idle" },
        { name: "Data Scraper X", status: "Active" },
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
                        <p className="text-muted-foreground">Overview of your autonomous agents and performance.</p>
                    </div>
                    <Button variant="primary" asChild>
                        <Link to="/dashboard/create-agent">
                            <PlusIcon className="size-4" weight="bold" />
                            New Agent
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Agents", value: "12", change: "+2 this week", icon: RobotIcon },
                        { label: "Active Sessions", value: "843", change: "+12% vs last week", icon: PulseIcon },
                        { label: "Total Calls", value: "2.4k", change: "+150 this month", icon: TrendUpIcon },
                    ].map((stat, i) => (
                        <Card key={i} className="bg-black/40 backdrop-blur-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary" weight="bold" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Agents (2/3 width) */}
                    <Card className="lg:col-span-2 bg-black/40 backdrop-blur-md h-fit">
                        <CardHeader>
                            <CardTitle className="text-white">Active Agents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {agents.map((agent, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center">
                                                <RobotIcon className="size-5 text-primary" weight="fill" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white group-hover:text-primary transition-colors">{agent.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${agent.status === "Active" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500"}`} />
                                                    <span className="text-xs text-muted-foreground">{agent.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions / System Status (1/3 width) */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-primary/20 via-black/40 to-black/40 border-primary/20 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <LightningIcon className="size-4 text-primary" weight="fill" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 hover:bg-white/5 hover:text-white hover:border-primary/50 transition-all">
                                    <PlusIcon className="size-5" />
                                    <span className="text-xs">Deploy</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 hover:bg-white/5 hover:text-white hover:border-primary/50 transition-all">
                                    <FileTextIcon className="size-5" />
                                    <span className="text-xs">Logs</span>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">System Health</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>CPU Usage</span>
                                        <span className="text-white">45%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[45%] rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Memory</span>
                                        <span className="text-white">72%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-chart-2 w-[72%] rounded-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    )
}