import * as React from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
}

export function ResizablePanelGroup({
  className,
  direction = "horizontal",
  children,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <div
      className={cn(
        "flex w-full h-full",
        direction === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
}

export function ResizablePanel({
  className,
  children,
  ...props
}: ResizablePanelProps) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
}

export function ResizableHandle({
  className,
  withHandle,
  ...props
}: ResizableHandleProps) {
  return (
    <div
      className={cn(
        "relative flex w-px items-center justify-center bg-border transition-colors hover:bg-ring",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border" />
      )}
    </div>
  );
}

