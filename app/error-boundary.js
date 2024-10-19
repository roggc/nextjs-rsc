import React from "react";
import MyError from "./components/my-error";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // componentDidCatch(error, errorInfo) {
  //   console.error("ErrorBoundary caught an error", error, errorInfo);
  // }

  render() {
    if (this.state.hasError) {
      return (
        <MyError
          errorMessage={this.state.error && this.state.error.toString()}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
