import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BookViewPage } from './pages/BookViewPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:hbkFile/*" element={<BookViewPage />} />
    </Routes>
  );
}

export default App;
