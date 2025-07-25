import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary - エラーがキャッチされました:', error)
    console.error('ErrorBoundary - エラー情報:', errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            エラーが発生しました
          </h2>
          <details className="text-sm text-red-700">
            <summary className="cursor-pointer mb-2">エラーの詳細</summary>
            <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded text-xs">
              {this.state.error?.toString()}
            </pre>
            <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded text-xs mt-2">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
} 