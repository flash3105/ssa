import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login.js';
import Home from './Pages/Home.js';
import AdminPage from './Pages/AdminPage.js';
import Problems from './Pages/Problems.js';
import SignUp from './Components/SignUp.js';
import Bookings from './Components/Bookings.js';
// Placeholder components for category pages
import AcademicChallenge from './Components/AcademicChallenge.js';
import MentalHealth from './Components/MentalHealth.js';
import CareerGuidance from './Components/CareerGuidance.js';
import FinancialAid from './Components/FinancialAid.js';
import AdministrativeIssues from './Components/AdministrativeIssues.js';
import Survery from './Components/Survery.js';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Define Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/SignUp" element={<SignUp/>}/>
          <Route path="/survery" element={<Survery/>}/>
          <Route path="/Bookings" element={<Bookings/>}/>
          {/* Dynamic routes for problem categories */}
          <Route path="/academic-challenge" element={<AcademicChallenge />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
          <Route path="/financial-aid" element={<FinancialAid />} />
          <Route path="/administrative-issues" element={<AdministrativeIssues />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
