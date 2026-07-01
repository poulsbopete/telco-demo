import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="text-[21px] font-semibold text-[#1d1d1f]">Something went wrong</h1>
            <p className="text-[13px] text-[#86868b] mt-3">
              Try a hard refresh (Cmd+Shift+R). If the page stays blank, the app bundle may be cached from a prior deploy.
            </p>
            <p className="text-[11px] text-[#86868b] mt-4 font-mono break-all">
              {this.state.error?.message || String(this.state.error)}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 rounded-full bg-[#0071e3] text-white text-[13px] font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
