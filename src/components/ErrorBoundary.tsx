import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

// React 19에서도 Error Boundary는 class component만 지원 (getDerivedStateFromError 필요)
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // 폴백 UI는 외부 의존성(shadcn Button, lucide 아이콘 등)을 사용하지 않음.
    // "다른 모든 것이 깨졌을 때"의 최후 보루이므로 순수 HTML+인라인 스타일만 사용.
    return (
      <div style={styles.container}>
        <p style={styles.message}>{ERROR_MESSAGE}</p>
        <button onClick={this.handleReload} style={styles.button}>
          {RELOAD_LABEL}
        </button>
      </div>
    );
  }
}

// Error Boundary는 React 렌더 트리 바깥에서 동작하므로 i18n 훅 사용 불가.
// 다국어 대신 한국어 + 영어 병기로 최소 메시지만 표시
const ERROR_MESSAGE = '문제가 발생했습니다.\nSomething went wrong.';
const RELOAD_LABEL = '새로고침 · Reload';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    padding: '24px',
    textAlign: 'center' as const,
  },
  message: {
    color: '#888',
    fontSize: '14px',
    whiteSpace: 'pre-line' as const,
    margin: '0 0 16px',
  },
  button: {
    padding: '6px 16px',
    fontSize: '13px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
  },
} as const;

export default ErrorBoundary;
