"use client";

import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("App boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            FindBack PH ran into a problem while loading this page. If this keeps happening,
            check your Vercel environment variables and database configuration.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-primary mt-6"
          >
            Reload page
          </button>
          {this.state.error?.message ? (
            <p className="mx-auto mt-4 max-w-md text-xs text-slate-400">
              {this.state.error.message}
            </p>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
