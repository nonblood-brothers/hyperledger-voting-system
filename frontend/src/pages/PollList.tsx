import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/api.service';
import { Poll, PollStatus } from '../types';

const PollList: React.FC = () => {
  const { isAdmin, isKycVerified } = useAuth();
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [finishedPolls, setFinishedPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      // These endpoints don't exist yet, so we'll use mock data for now
      // In a real implementation, we would call the API
      // const activeResult = await pollApi.getActivePolls();
      // const finishedResult = await pollApi.getFinishedPolls();

      // Mock data for demonstration
      const mockActivePolls: Poll[] = [
        {
          id: '1',
          title: 'Student Council Election',
          description: 'Vote for the next student council president',
          authorStudentIdNumber: 'student1',
          questionIds: ['q1', 'q2', 'q3'],
          participantIds: [],
          plannedStartDate: Date.now(),
          plannedEndDate: Date.now() + 86400000, // 1 day later
          status: PollStatus.ACTIVE,
          createdAt: Date.now() - 86400000, // 1 day ago
          updatedAt: Date.now() - 86400000,
        },
        {
          id: '2',
          title: 'Campus Improvement Survey',
          description: 'Help us decide which campus facilities to improve next',
          authorStudentIdNumber: 'student2',
          questionIds: ['q4', 'q5'],
          participantIds: [],
          plannedStartDate: Date.now() - 172800000, // 2 days ago
          plannedEndDate: Date.now() + 172800000, // 2 days later
          status: PollStatus.ACTIVE,
          createdAt: Date.now() - 259200000, // 3 days ago
          updatedAt: Date.now() - 259200000,
        },
      ];

      const mockFinishedPolls: Poll[] = [
        {
          id: '3',
          title: 'Cafeteria Menu Voting',
          description: 'Vote for your favorite dishes to be included in the cafeteria menu',
          authorStudentIdNumber: 'student3',
          questionIds: ['q6', 'q7', 'q8', 'q9'],
          participantIds: ['student1', 'student2'],
          plannedStartDate: Date.now() - 604800000, // 7 days ago
          plannedEndDate: Date.now() - 86400000, // 1 day ago
          status: PollStatus.FINISHED,
          createdAt: Date.now() - 691200000, // 8 days ago
          updatedAt: Date.now() - 86400000,
        },
      ];

      setActivePolls(mockActivePolls);
      setFinishedPolls(mockFinishedPolls);
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
                onClick={() => window.location.href = `/polls/${poll.id}`}
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
          <Button variant="success" onClick={() => window.location.href = "/polls/create"}>
            Create New Poll
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

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
