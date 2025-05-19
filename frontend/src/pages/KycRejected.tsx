import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const KycRejected: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header as="h4" className="text-center">
              KYC Verification Rejected
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                <Alert.Heading>Your account verification was rejected</Alert.Heading>
                <p>
                  Hello {user?.firstName} {user?.lastName},
                </p>
                <p>
                  Unfortunately, your account verification has been rejected by the administrator.
                </p>
                <p>
                  This could be due to various reasons, such as:
                </p>
                <ul>
                  <li>Incorrect student ID number</li>
                  <li>Name mismatch with university records</li>
                  <li>Other verification issues</li>
                </ul>
                <p>
                  Please contact the system administrator for more information and to resolve this issue.
                </p>
                <hr />
                <p className="mb-0">
                  You can try registering again with correct information or contact the administrator for assistance.
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

export default KycRejected;