import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AppViewPage } from './pages/AppViewPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:locale" element={<AppViewPage />} />
      <Route path="/:locale/:section/*" element={<AppViewPage />} />
    </Routes>
  );
}

export default App;
