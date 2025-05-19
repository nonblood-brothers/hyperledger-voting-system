import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { pollApi } from '../../services/api.service';
import { Poll, PollStatus } from '../../types';

const PollReview: React.FC = () => {
  const { isAdmin } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const result = await pollApi.getPollsInReviewStatus();
      setPolls(result.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls. Please try again.');
      
      // Mock data for demonstration
      const mockPolls: Poll[] = [
        {
          id: '4',
          title: 'Library Hours Extension',
          description: 'Should the library extend its opening hours during exam period?',
          authorStudentIdNumber: 'student4',
          questionIds: ['q10', 'q11'],
          participantIds: [],
          plannedStartDate: Date.now() + 86400000, // 1 day later
          plannedEndDate: Date.now() + 604800000, // 7 days later
          status: PollStatus.REVIEW,
          createdAt: Date.now() - 86400000, // 1 day ago
          updatedAt: Date.now() - 86400000,
        },
        {
          id: '5',
          title: 'Campus Wi-Fi Improvement',
          description: 'Vote on which areas of the campus need Wi-Fi improvement',
          authorStudentIdNumber: 'student5',
          questionIds: ['q12', 'q13', 'q14'],
          participantIds: [],
          plannedStartDate: null,
          plannedEndDate: null,
          status: PollStatus.REVIEW,
          createdAt: Date.now() - 172800000, // 2 days ago
          updatedAt: Date.now() - 172800000,
        },
      ];
      
      setPolls(mockPolls);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (pollId: string, status: PollStatus) => {
    try {
      await pollApi.updatePollReviewStatus(pollId, status);
      setSuccessMessage(`Poll ${status === PollStatus.APPROVED_AND_WAITING ? 'approved' : 'rejected'} successfully.`);
      
      // Remove the poll from the list
      setPolls(polls.filter(poll => poll.id !== pollId));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating poll status:', err);
      setError('Failed to update poll status. Please try again.');
    }
  };

  if (!isAdmin) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          You do not have permission to access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Poll Review</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      
      <Card className="mt-3">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Polls Pending Review</h5>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={fetchPolls}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-3">Loading polls...</div>
          ) : polls.length === 0 ? (
            <div className="text-center py-3">No polls pending review.</div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Planned Start</th>
                  <th>Planned End</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
                  <tr key={poll.id}>
                    <td>
                      <strong>{poll.title}</strong>
                      <div className="text-muted small">{poll.description}</div>
                    </td>
                    <td>{poll.authorStudentIdNumber}</td>
                    <td>{new Date(poll.createdAt).toLocaleDateString()}</td>
                    <td>
                      {poll.plannedStartDate 
                        ? new Date(poll.plannedStartDate).toLocaleDateString() 
                        : 'Not set'}
                    </td>
                    <td>
                      {poll.plannedEndDate 
                        ? new Date(poll.plannedEndDate).toLocaleDateString() 
                        : 'Not set'}
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleUpdateStatus(poll.id, PollStatus.APPROVED_AND_WAITING)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUpdateStatus(poll.id, PollStatus.DECLINED)}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PollReview;