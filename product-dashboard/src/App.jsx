import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import ProductDetail from './components/ProductDetail'
import StageDetail from './components/StageDetail'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>Product Development Dashboard</h1>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/product/:productId/stage/:stageCategory/:stageName" element={<StageDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
