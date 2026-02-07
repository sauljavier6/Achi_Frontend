import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.js';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.js';

function App() {

  return (
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
  )
}

export default App
