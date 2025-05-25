import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import { Poll, PollStatus } from '../types';

const PollList: React.FC = () => {
  const { isAdmin, isKycVerified, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [finishedPolls, setFinishedPolls] = useState<Poll[]>([]);
  const [pendingPolls, setPendingPolls] = useState<Poll[]>([]);
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

      // Fetch pending polls (polls in REVIEW status) created by the current user
      let pendingPolls: Poll[] = [];
      if (user && !isAdmin && isKycVerified) {
        pendingPolls = await pollApi.getMyPendingPolls();
      }

      setActivePolls(activePolls);
      setFinishedPolls(finishedPolls);
      setPendingPolls(pendingPolls);
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
            {poll.plannedEndDate
                ? <small>
                    {isActive
                        ? `Ends: ${new Date((poll.plannedEndDate || 0) * 1000).toUTCString()}`
                        : `Ended: ${new Date((poll.plannedEndDate || 0) * 1000).toUTCString()}`
                    }
                  </small>
                : <small>Poll was finished by creator on {new Date(poll.updatedAt * 1000).toUTCString()}</small>}
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
            <small>Created: {new Date(poll.createdAt * 1000).toUTCString()}</small>
          </Card.Footer>
        </Card>
      </Col>
    );
  };

  const renderPendingPollCard = (poll: Poll) => {
    let badgeVariant = "warning";
    let badgeText = "Pending Approval";
    let buttonVariant = "warning";

    if (poll.status === PollStatus.DECLINED) {
      badgeVariant = "danger";
      badgeText = "Rejected";
      buttonVariant = "danger";
    } else if (poll.status === PollStatus.APPROVED_AND_WAITING) {
      badgeVariant = "info";
      badgeText = "Approved & Waiting";
      buttonVariant = "info";
    }

    return (
      <Col md={6} lg={4} className="mb-4" key={poll.id}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Badge bg={badgeVariant}>{badgeText}</Badge>
            <small>
              {poll.plannedStartDate 
                ? `Planned start: ${new Date(poll.plannedStartDate * 1000).toUTCString()}`
                : 'No start date set'}
            </small>
          </Card.Header>
          <Card.Body>
            <Card.Title>{poll.title}</Card.Title>
            <Card.Text>{poll.description}</Card.Text>
            <div className="d-grid gap-2">
              <Button 
                variant={buttonVariant} 
                onClick={() => navigate(`/polls/${poll.id}`)}
              >
                View & Edit
              </Button>
            </div>
          </Card.Body>
          <Card.Footer className="text-muted">
            <small>Created: {new Date(poll.createdAt * 1000).toUTCString()}</small>
          </Card.Footer>
        </Card>
      </Col>
    );
  };

  // Only show this warning for logged-in users who are not KYC verified
  if (user && !isKycVerified && !isAdmin) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Your account needs to be verified before you can create or vote in polls.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Polls</h2>
        {isKycVerified && !isAdmin && (
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
          {/* Pending Polls Section - Only visible to non-admin users with KYC verification */}
          {!isAdmin && isKycVerified && pendingPolls.length > 0 && (
            <>
              <h3>My Polls</h3>
              <Alert variant="info">
                These polls are in various stages of the approval process. You can view and edit all of them, including those that are pending approval, rejected, or approved and waiting to start.
              </Alert>
              <Row>
                {pendingPolls.map(renderPendingPollCard)}
              </Row>
              <hr className="my-4" />
            </>
          )}

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
