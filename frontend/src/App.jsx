import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/dashboard/DashBoard.jsx';
import History from './components/dashboard/History';
import Graph from './components/dashboard/Graph';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import SagemcomLogo from './assets/LOGO.png';
import 'C:/Users/aloui/Desktop/salle-serveur/frontend/src/styles/styles.css';


export default function App() {
  const [type, setType] = useState("Login");

  // Function to switch between signIn and signUp forms
  const handleOnClick = (text) => {
    if (text !== type) {
      setType(text);
      return;
    }
  };

  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");

  return (
    <>
      <GlobalStyles />
      <AuthProvider>
        <div>
          {/* Logo global affiché sur toutes les pages */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0 0 0" }}>
            <img src={SagemcomLogo} alt="LOGO" style={{ maxWidth: 250 }} />
          </div>
          <Router>
            <div style={{ width: "100%" }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                      <div className={containerClass} id="container">
                        <SignUp />
                        <Login />
                        <div className="overlay-container">
                          <div className="overlay">
                            <div className="overlay-panel overlay-left">
                              <h1>Bon Retour!</h1>
                              <p>
                                Pour rester connecté avec nous, veuillez vous connecter avec vos informations personnelles.
                              </p>
                              <button
                                className="ghost"
                                id="signIn"
                                onClick={() => handleOnClick("Login")}
                              >
                                se connecter
                              </button>
                            </div>
                            <div className="overlay-panel overlay-right">
                              <h1>Bienvenue !</h1>
                              <p> Entrez vos informations personnelles et rejoignez-nous.</p>
                              <button
                                className="ghost"
                                id="signUp"
                                onClick={() => handleOnClick("signUp")}
                              >
                                s'inscrire
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/graph"
                  element={
                    <ProtectedRoute>
                      <Graph />
                    </ProtectedRoute>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Routes>
            </div>
          </Router>
        </div>
      </AuthProvider>
    </>
  );
}