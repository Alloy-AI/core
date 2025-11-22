import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/lib/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/lib/components/ui/form";
import { Input } from "@/src/lib/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { ArrowLeftIcon, PuzzlePieceIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/lib/components/ui/select";

// Define the schema for the extension form
const extensionFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  category: z.string({
    message: "Category is required.",
  }),
  content: z.string().optional(),
});

type ExtensionFormValues = z.infer<typeof extensionFormSchema>;

const CATEGORIES = [
  "Text Knowledge",
  "HTML Knowledge",
  "PDF Knowledge",
  "CSV Knowledge",
  "URL Knowledge",
  "Prompt Set",
  "MCP (Coming Soon)",
  "Rust Tool (Coming Soon)",
  "JavaScript Tool (Coming Soon)",
  "Python Tool (Coming Soon)",
  "RPC Tool",
];

export default function CreateExtensionPage() {
  const form = useForm<ExtensionFormValues>({
    resolver: zodResolver(extensionFormSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  const selectedCategory = form.watch("category");

  function onSubmit(data: ExtensionFormValues) {
    console.log("Form Submitted:", data);
    toast.success("Extension created successfully");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8 relative">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Create New Extension</h1>
          <p className="text-muted-foreground">Publish a new tool or knowledge base to the marketplace.</p>
        </div>

        <Card className="bg-background/40 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PuzzlePieceIcon className="size-5 text-primary" weight="fill" />
              Basic Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">Provide the basic details for your marketplace item</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a descriptive name for your item" {...field} className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/30 border-border text-foreground focus:ring-primary">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-medium text-foreground mb-4">Content</h3>
                    <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground">Content</FormLabel>
                        <FormControl>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground focus-visible:border-primary font-mono"
                                placeholder={selectedCategory === "Text Knowledge" ? "Enter your text content..." : "Content configuration..."}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" asChild className="border-border hover:bg-muted/50 text-foreground">
                        <Link to="/extensions">Cancel</Link>
                    </Button>
                    <Button type="submit" variant="primary">
                        Create Item
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

