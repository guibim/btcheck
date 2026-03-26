import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentFng } from "@/services/fearGreedService";
import { getFngColor, getFngBand, FngData } from "@/lib/fearGreedUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Fear & Greed Badge for header
 * Shows current index value with colored dot indicator
 */
export const FearGreedBadge = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FngData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(false);
    
    try {
      const current = await fetchCurrentFng();
      if (current) {
        setData(current);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    navigate("/fear-and-greed");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className="flex items-center gap-2 text-muted-foreground"
              aria-label="Fear & Greed Index - temporarily unavailable"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Fear & Greed</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Temporarily unavailable</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const value = parseInt(data.value);
  const color = getFngColor(value);
  const band = getFngBand(value);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2 hover:bg-accent"
      aria-label={`Fear & Greed Index: ${value} - ${band}`}
    >
      <span
        className="inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">
        Fear & Greed
      </span>
      <span className="text-sm text-muted-foreground">
        {value} · {band}
      </span>
    </Button>
  );
};
