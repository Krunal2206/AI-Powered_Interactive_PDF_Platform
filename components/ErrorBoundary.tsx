"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  // Optional custom fallback — if not provided the default UI is shown
  fallback?: ReactNode;
  // Label shown in the error UI to identify which section crashed
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
      `[ErrorBoundary]${sectionLabel}`,
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
        <DefaultErrorUI
          error={this.state.error}
          section={this.props.section}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorUIProps {
  readonly error: Error | null;
  readonly section?: string;
  readonly onReset: () => void;
}

function DefaultErrorUI({ error, section, onReset }: DefaultErrorUIProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="p-4 rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        {section ? `${section} ran into a problem` : "Something went wrong"}
      </h2>

      <p className="text-slate-400 text-sm mb-2 max-w-md">
        An unexpected error occurred. You can try refreshing this section or go
        back to the dashboard.
      </p>

      {process.env.NODE_ENV === "development" && error && (
        <pre className="mt-2 mb-6 text-left text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-4 max-w-lg overflow-auto w-full">
          {error.message}
          {"\n"}
          {error.stack}
        </pre>
      )}

      <div className="flex items-center gap-3 mt-4">
        <Button
          onClick={onReset}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>

        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
          className="border-slate-700 hover:bg-slate-800 text-slate-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to dashboard
        </Button>
      </div>
    </div>
  );
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
