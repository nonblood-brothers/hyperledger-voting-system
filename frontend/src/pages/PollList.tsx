import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import { Poll, PollStatus } from '../types';

const PollList: React.FC = () => {
  const { isAdmin, isKycVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [finishedPolls, setFinishedPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message ? location.state.message : null
  );

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      // Use the real API endpoints
      const activePolls = await pollApi.getActivePolls();
      const finishedPolls = await pollApi.getFinishedPolls();

      setActivePolls(activePolls);
      setFinishedPolls(finishedPolls);
      setError('');
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPollCard = (poll: Poll) => {
    const isActive = poll.status === PollStatus.ACTIVE;

    return (
      <Col md={6} lg={4} className="mb-4" key={poll.id}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Badge bg={isActive ? 'success' : 'secondary'}>
              {isActive ? 'Active' : 'Finished'}
            </Badge>
            <small>
              {isActive 
                ? `Ends: ${new Date(poll.plannedEndDate || 0).toLocaleDateString()}`
                : `Ended: ${new Date(poll.plannedEndDate || 0).toLocaleDateString()}`
              }
            </small>
          </Card.Header>
          <Card.Body>
            <Card.Title>{poll.title}</Card.Title>
            <Card.Text>{poll.description}</Card.Text>
            <div className="d-grid gap-2">
              <Button 
                variant={isActive ? 'primary' : 'outline-secondary'} 
                onClick={() => navigate(`/polls/${poll.id}`)}
              >
                {isActive ? 'Vote Now' : 'View Results'}
              </Button>
            </div>
          </Card.Body>
          <Card.Footer className="text-muted">
            <small>Created: {new Date(poll.createdAt).toLocaleDateString()}</small>
          </Card.Footer>
        </Card>
      </Col>
    );
  };

  if (!isKycVerified && !isAdmin) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Your account needs to be verified before you can access polls.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Polls</h2>
        {isKycVerified && (
          <Button variant="success" onClick={() => navigate("/polls/create")}>
            Create New Poll
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}

      {loading ? (
        <div className="text-center py-5">Loading polls...</div>
      ) : (
        <>
          <h3>Active Polls</h3>
          {activePolls.length === 0 ? (
            <Alert variant="info">No active polls available.</Alert>
          ) : (
            <Row>
              {activePolls.map(renderPollCard)}
            </Row>
          )}

          <h3 className="mt-5">Finished Polls</h3>
          {finishedPolls.length === 0 ? (
            <Alert variant="info">No finished polls available.</Alert>
          ) : (
            <Row>
              {finishedPolls.map(renderPollCard)}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default PollList;
