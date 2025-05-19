import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const KycPending: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header as="h4" className="text-center">
              KYC Verification Pending
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <Alert.Heading>Your account is under review</Alert.Heading>
                <p>
                  Hello {user?.firstName} {user?.lastName},
                </p>
                <p>
                  Your account has been created successfully, but it needs to be verified by an administrator before you can access all features of the system.
                </p>
                <p>
                  Please check back later to see if your account has been approved. You will be able to log in again once your account is verified.
                </p>
                <hr />
                <p className="mb-0">
                  If you have any questions, please contact the system administrator.
                </p>
              </Alert>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-secondary" onClick={logout}>
                  Logout
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default KycPending;