import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  message?: string;
}

const Login: React.FC = () => {
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentIdNumber || !password || !secretKey) {
      setError('All fields are required');
      return;
    }

    try {
      await login(studentIdNumber, password, secretKey);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header as="h4" className="text-center">
              Student Voting System - Login
            </Card.Header>
            <Card.Body>
              {state?.message && (
                <Alert variant="success">{state.message}</Alert>
              )}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="studentIdNumber">
                  <Form.Label>Student ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your student ID number"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="secretKey">
                  <Form.Label>Secret Key</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              Don't have an account?{' '}
              <Link to="/register">Register here</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;