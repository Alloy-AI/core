import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/lib/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/lib/components/ui/form";
import { Input } from "@/src/lib/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { RobotIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

// Define the schema for the agent form
const agentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export default function CreateAgentPage() {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: AgentFormValues) {
    console.log("Form Submitted:", data);
    toast.success("Agent created successfully");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-2xl space-y-8 relative">
        
        <div className="absolute -top-16 left-0">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-white pl-0 gap-2">
                <Link to="/dashboard">
                    <ArrowLeftIcon className="size-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Create New Agent</h1>
          <p className="text-muted-foreground">Configure your new autonomous agent.</p>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RobotIcon className="size-5 text-primary" weight="fill" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Trading Bot Alpha" {...field} className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:border-primary" />
                      </FormControl>
                      <FormDescription>
                        This is the public display name of your agent.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description</FormLabel>
                      <FormControl>
                         <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white focus-visible:border-primary"
                            placeholder="Describe what this agent does..."
                            {...field}
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="primary" className="w-full">
                  Create Agent
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
