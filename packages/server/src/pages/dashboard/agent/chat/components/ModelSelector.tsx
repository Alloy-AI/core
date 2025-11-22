import { useEffect, useState } from "react";
import { formatEther } from "viem";
import Icon from "@/src/lib/components/custom/Icon";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/lib/components/ui/select";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useChatStore, useStore } from "@/src/lib/hooks/use-store";

interface LLMModel {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  is_active: boolean;
  price_per_call: number;
}

export default function ModelSelector() {
  const haithe = useHaitheApi();
  const { selectedOrg } = useStore();
  const { selectedModel, setSelectedModel } = useChatStore();

  // Get enabled models only
  const { data: enabledModels, isLoading: isLoadingEnabled } =
    haithe.getEnabledModels(Number(selectedOrg?.id));

  // Auto-select first model if models exist and none is selected
  useEffect(() => {
    if (enabledModels && enabledModels.length > 0 && !selectedModel) {
      setSelectedModel(enabledModels[0].name);
    }
  }, [enabledModels, selectedModel, setSelectedModel]);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "Google":
        return "Sparkles";
      case "OpenAI":
        return "Zap";
      case "DeepSeek":
        return "Brain";
      case "Haithe":
        return "Star";
      default:
        return "Bot";
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case "Google":
        return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.svg";
      case "OpenAI":
        return "https://plugins.jetbrains.com/files/21671/668761/icon/default.svg";
      case "DeepSeek":
        return "https://cdn.worldvectorlogo.com/logos/deepseek-2.svg";
      case "Haithe":
        return "https://pbs.twimg.com/media/Gv-AY7eXEAAIM-l.jpg";
      default:
        return null;
    }
  };

  const renderProviderLogo = (provider: string, className: string) => {
    const logoUrl = getProviderLogo(provider);
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${provider} logo`}
          className={className}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
      );
    }
    return null;
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
  };

  const currentModel = enabledModels?.find(
    (model: LLMModel) => model.name === selectedModel,
  );

  if (isLoadingEnabled) {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <Icon name="LoaderCircle" className="size-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!enabledModels || enabledModels.length === 0) {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <Icon name="Bot" className="size-4" />
        No Models Available
      </Button>
    );
  }

  return (
    <Select
      value={selectedModel || undefined}
      onValueChange={handleModelSelect}
    >
      <SelectTrigger className="w-auto gap-2">
        <div className="flex items-center gap-2">
          {currentModel && renderProviderLogo(currentModel.provider, "size-3")}
          <SelectValue placeholder="Select Model">
            {currentModel ? (
              <span className="font-medium">{currentModel.display_name}</span>
            ) : (
              "Select Model"
            )}
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="mt-2 w-80">
        <div className="space-y-1 p-2">
          {enabledModels.map((model: LLMModel) => (
            <SelectItem
              key={model.id}
              value={model.name}
              className="p-3 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-1.5 rounded-md bg-muted flex items-center justify-center min-w-[28px] min-h-[28px]">
                  {renderProviderLogo(model.provider, "size-3.5")}
                  <Icon
                    name={getProviderIcon(model.provider)}
                    className="size-3.5 text-muted-foreground hidden"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {model.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({model.provider})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      ${formatEther(BigInt(model.price_per_call))} per call
                    </p>
                    {!model.is_active && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-500/20 border-muted/50"
                      >
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
