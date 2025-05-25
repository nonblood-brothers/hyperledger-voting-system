import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Modal, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { pollApi } from '../../services/poll.service';
import { Poll, PollOption, PollStatus } from '../../types';

const PollReview: React.FC = () => {
  const { isAdmin } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      setPolls([]);
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

  const handleViewDetails = async (poll: Poll) => {
    try {
      setLoadingDetails(true);
      setSelectedPoll(poll);
      setShowModal(true);

      // Fetch poll options
      console.log(poll)
      const options = await pollApi.getPollOptionsByPollId(poll.id);
      setPollOptions(options);
    } catch (err) {
      console.error('Error fetching poll details:', err);
      setError('Failed to load poll details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPoll(null);
    setPollOptions([]);
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

  // Poll Details Modal
  const renderPollDetailsModal = () => {
    return (
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Poll Details {selectedPoll && getStatusBadge(selectedPoll.status)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-3">Loading poll details...</div>
          ) : selectedPoll ? (
            <>
              <h4>{selectedPoll.title}</h4>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Text>{selectedPoll.description}</Card.Text>
                  <div className="d-flex flex-column text-muted">
                    <small>Author: {selectedPoll.authorStudentIdNumber}</small>
                    <small>Created: {formatDate(selectedPoll.createdAt)}</small>
                    <small>Planned Start: {formatDate(selectedPoll.plannedStartDate)}</small>
                    <small>Planned End: {formatDate(selectedPoll.plannedEndDate)}</small>
                  </div>
                </Card.Body>
              </Card>

              <h5>Poll Options</h5>
              {pollOptions.length === 0 ? (
                <Alert variant="info">No options have been added to this poll yet.</Alert>
              ) : (
                <ListGroup className="mb-4">
                  {pollOptions.map((option) => (
                    <ListGroup.Item 
                      key={option.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>{option.text}</div>
                      <Badge bg="primary" pill>
                        {option.voteCount} votes
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          ) : (
            <Alert variant="warning">No poll selected.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedPoll && (
            <>
              <Button 
                variant="success" 
                onClick={() => {
                  handleUpdateStatus(selectedPoll.id, PollStatus.APPROVED_AND_WAITING);
                  handleCloseModal();
                }}
              >
                Approve
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleUpdateStatus(selectedPoll.id, PollStatus.DECLINED);
                  handleCloseModal();
                }}
              >
                Reject
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <Container className="mt-4">
      <h2>Poll Review</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {renderPollDetailsModal()}

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
                    <td>{new Date(poll.createdAt * 1000).toUTCString()}</td>
                    <td>
                      {poll.plannedStartDate 
                        ? new Date(poll.plannedStartDate * 1000).toUTCString()
                        : 'Not set'}
                    </td>
                    <td>
                      {poll.plannedEndDate 
                        ? new Date(poll.plannedEndDate * 1000).toUTCString()
                        : 'Not set'}
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewDetails(poll)}
                      >
                        View Details
                      </Button>
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

// Helper function to format timestamp to readable date
const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'Not set';
  return new Date(timestamp * 1000).toLocaleString();
};

// Helper function to get status badge
const getStatusBadge = (status: PollStatus) => {
  let variant = 'secondary';

  switch (status) {
    case PollStatus.ACTIVE:
      variant = 'success';
      break;
    case PollStatus.REVIEW:
      variant = 'warning';
      break;
    case PollStatus.APPROVED_AND_WAITING:
      variant = 'info';
      break;
    case PollStatus.DECLINED:
      variant = 'danger';
      break;
    case PollStatus.FINISHED:
      variant = 'secondary';
      break;
    default:
      variant = 'secondary';
  }

  return <Badge bg={variant}>{status}</Badge>;
};

export default PollReview;
