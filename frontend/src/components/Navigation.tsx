import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Student Voting System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link href="#" onClick={(e) => { e.preventDefault(); navigate('/polls'); }}>Polls</Nav.Link>
                {isAdmin && (
                  <>
                    <Nav.Link href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/kyc-review'); }}>KYC Review</Nav.Link>
                    <Nav.Link href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/poll-review'); }}>Poll Review</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  Signed in as: {user?.firstName} {user?.lastName}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</Nav.Link>
                <Nav.Link href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
