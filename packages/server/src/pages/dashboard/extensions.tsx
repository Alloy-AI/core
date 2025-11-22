import Layout from "./layout";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent } from "@/src/lib/components/ui/card";
import { Link } from "@tanstack/react-router";
import { 
  PuzzlePieceIcon, 
  PlusIcon,
  TagIcon
} from "@phosphor-icons/react";
import { Badge } from "@/src/lib/components/ui/badge";
import { mockExtensions } from "@/src/lib/mock";

export default function ExtensionsPage() {
    const extensions = mockExtensions;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">My Extensions</h1>
                        <p className="text-muted-foreground">Manage your published tools and knowledge bases.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="primary" asChild>
                            <Link to="/dashboard/create-extension">
                                <PlusIcon className="size-4" weight="bold" />
                                New Extension
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Extensions Grid */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {extensions.map((extension) => (
                        <Card key={extension.id} className="bg-background/40 backdrop-blur-md border-border hover:bg-muted/20 transition-all cursor-pointer group h-full">
                            <CardContent className="p-6 h-full">
                                <div className="flex flex-col gap-4 h-full">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center shrink-0">
                                            <PuzzlePieceIcon className="size-6 text-primary" weight="fill" />
                                        </div>
                                        <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-border">
                                            {extension.category}
                                        </Badge>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                            {extension.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                            <div className="flex items-center gap-1">
                                                <TagIcon className="size-3" />
                                                v1.0.0
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">
                                            Created {extension.created}
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 px-0">
                                            Manage Item
                                        </Button>
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

