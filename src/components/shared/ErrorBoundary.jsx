import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%', minHeight: 200,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Montserrat, sans-serif', fontSize: 10,
          letterSpacing: '0.2em'
        }}>
          {this.props.fallback || null}
        </div>
      )
    }
    return this.props.children
  }
}
