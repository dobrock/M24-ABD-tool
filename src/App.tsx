import Navigation from './components/Navigation';

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<ExportForm />} />
        <Route path="/verwaltung" element={<VorgangsListe />} />
        <Route path="/vorgaenge/:id" element={<VorgangDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
