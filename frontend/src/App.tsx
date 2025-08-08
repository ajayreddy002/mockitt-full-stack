import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotificationSystem } from './components/common/NotificationSystem';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <AppRoutes />
          <NotificationSystem />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
