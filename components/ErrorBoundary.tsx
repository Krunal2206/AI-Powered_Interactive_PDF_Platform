"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface InlineErrorUIProps {
  readonly error: Error | null;
  readonly section?: string;
  readonly onReset: () => void;
}

export function InlineErrorUI({ error, section, onReset }: InlineErrorUIProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-red-950/20 border border-red-800/30 rounded-xl m-4">
      <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />

      <p className="text-sm font-medium text-slate-300 mb-1">
        {section ? `${section} crashed` : "This section crashed"}
      </p>

      <p className="text-xs text-slate-500 mb-4">
        The rest of the page is still working.
      </p>

      {process.env.NODE_ENV === "development" && error && (
        <pre className="text-left text-xs text-red-400 bg-red-950/40 rounded p-3 mb-4 max-w-full overflow-auto">
          {error.message}
        </pre>
      )}

      <Button
        size="sm"
        onClick={onReset}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </Button>
    </div>
  );
}

export class InlineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const sectionLabel = this.props.section ? ` (${this.props.section})` : "";
    console.error(
      `[InlineErrorBoundary]${sectionLabel}`,
      error,
      info.componentStack,
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <InlineErrorUI
          error={this.state.error}
          section={this.props.section}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
