import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Switch } from "@/src/lib/components/ui/switch";
import { Label } from "@/src/lib/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Separator } from "@/src/lib/components/ui/separator";
import { Badge } from "@/src/lib/components/ui/badge";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { Skeleton } from "@/src/lib/components/ui/skeleton";

export default function ChatSettings() {
  const { id } = useParams({
    from: '/dashboard/agents/$id/chat/settings'
  });

  const haithe = useHaitheApi();
  const { selectedOrg } = useStore();

  // Get agent data
  const agentsQuery = haithe.getProjects(Number(selectedOrg?.id));
  const agent = agentsQuery.data?.find((a) => a.id.toString() === id);

  // Settings state
  const [settings, setSettings] = useState({
    autoScroll: true,
    soundNotifications: true,
    typingIndicator: true,
    messageHistory: 100,
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'en' as string
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (agentsQuery.isPending) {
    return (
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md w-full">
          <Icon name="Bot" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Agent Not Found</h3>
            <p className="text-muted-foreground">
              The agent you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/agents">Back to Agents</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Chat Settings</h1>
          <p className="text-muted-foreground">
            Configure your chat experience with {agent.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/agents/${id}/chat`}>
              Back to Chat
            </Link>
          </Button>
          <Button>Save Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" className="size-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic chat preferences and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-scroll to new messages</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically scroll to the latest message
                </p>
              </div>
              <Switch
                checked={settings.autoScroll}
                onCheckedChange={(checked) => handleSettingChange('autoScroll', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when receiving new messages
                </p>
              </div>
              <Switch
                checked={settings.soundNotifications}
                onCheckedChange={(checked) => handleSettingChange('soundNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Typing indicator</Label>
                <p className="text-sm text-muted-foreground">
                  Show when the agent is typing
                </p>
              </div>
              <Switch
                checked={settings.typingIndicator}
                onCheckedChange={(checked) => handleSettingChange('typingIndicator', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Monitor" className="size-5" />
              Display Settings
            </CardTitle>
            <CardDescription>
              Customize the appearance of your chat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Message History Limit</Label>
              <Select 
                value={settings.messageHistory.toString()} 
                onValueChange={(value) => handleSettingChange('messageHistory', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 messages</SelectItem>
                  <SelectItem value="100">100 messages</SelectItem>
                  <SelectItem value="200">200 messages</SelectItem>
                  <SelectItem value="500">500 messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Agent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bot" className="size-5" />
              Agent Information
            </CardTitle>
            <CardDescription>
              Details about your AI agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Bot" className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {agent.description || "No description available"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Agent ID</span>
                <span className="text-sm font-mono">{agent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Project UID</span>
                <span className="text-sm font-mono">{agent.project_uid}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" className="size-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage your chat data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your chat conversations are stored securely and can be managed here.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Download" className="size-4 mr-2" />
                Export Chat History
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                <Icon name="Trash2" className="size-4 mr-2" />
                Clear Chat History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 