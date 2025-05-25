import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, ListGroup, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import {Poll, PollOption, PollStatus, UserRole} from '../types';

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [showStartPollModal, setShowStartPollModal] = useState(false);
  const [showEndPollModal, setShowEndPollModal] = useState(false);
  const [pollActionInProgress, setPollActionInProgress] = useState(false);
  const [pollActionError, setPollActionError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPollData(id);
    }
  }, [id]);

  const fetchPollData = async (pollId: string) => {
    try {
      setLoading(true);
      const pollData = await pollApi.getPollById(pollId);
      const optionsData = await pollApi.getPollOptionsByPollId(pollId);

      setPoll(pollData);
      setOptions(optionsData);
      setError('');
    } catch (err) {
      console.error('Error fetching poll data:', err);
      setError('Failed to load poll data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAuthor = poll && user && poll.authorStudentIdNumber === user.studentIdNumber;
  const canManageOptions = isAuthor && [PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll?.status || PollStatus.UNDEFINED);
  const canEditPoll = isAuthor && [PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll.status);
  const canStartPoll = isAuthor && poll.status === PollStatus.APPROVED_AND_WAITING;
  const canEndPoll = isAuthor && poll.status === PollStatus.ACTIVE;
  const hasUserVoted = poll && user && poll.participantIds.includes(user.studentIdNumber);
  const isAdmin = user?.role === UserRole.ADMIN;
  const canVote = user && poll?.status === PollStatus.ACTIVE && !hasUserVoted && options.length > 0 && !isAdmin;

  const handleOpenVoteModal = () => {
    // Additional safety checks before opening the modal
    if (!user) {
      // User is not authenticated
      return;
    }

    if (hasUserVoted) {
      // User has already voted
      return;
    }

    if (options.length === 0) {
      // No options available
      return;
    }

    if (poll?.status !== PollStatus.ACTIVE) {
      // Poll is not active
      return;
    }

    if (isAdmin) {
      // Admin users are not allowed to vote
      return;
    }

    setSelectedOption('');
    setVoteError('');
    setShowVoteModal(true);
  };

  const handleCloseVoteModal = () => {
    setShowVoteModal(false);
    setVoteError('');
  };

  const handleOpenStartPollModal = () => {
    setShowStartPollModal(true);
    setPollActionError('');
  };

  const handleCloseStartPollModal = () => {
    setShowStartPollModal(false);
    setPollActionError('');
  };

  const handleOpenEndPollModal = () => {
    setShowEndPollModal(true);
    setPollActionError('');
  };

  const handleCloseEndPollModal = () => {
    setShowEndPollModal(false);
    setPollActionError('');
  };

  const handleStartPoll = async () => {
    if (!id) {
      setPollActionError('Poll ID is missing');
      return;
    }

    try {
      setPollActionInProgress(true);
      setPollActionError('');

      await pollApi.startPoll(id);

      // Refresh poll data to show updated status
      await fetchPollData(id);

      setShowStartPollModal(false);
    } catch (err) {
      console.error('Error starting poll:', err);
      setPollActionError('Failed to start the poll. Please try again.');
    } finally {
      setPollActionInProgress(false);
    }
  };

  const handleEndPoll = async () => {
    if (!id) {
      setPollActionError('Poll ID is missing');
      return;
    }

    try {
      setPollActionInProgress(true);
      setPollActionError('');

      await pollApi.stopPoll(id);

      // Refresh poll data to show updated status
      await fetchPollData(id);

      setShowEndPollModal(false);
    } catch (err) {
      console.error('Error ending poll:', err);
      setPollActionError('Failed to end the poll. Please try again.');
    } finally {
      setPollActionInProgress(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      setVoteError('Please select an option to vote.');
      return;
    }

    try {
      setVotingInProgress(true);
      setVoteError('');

      if (!id) {
        throw new Error('Poll ID is missing');
      }

      await pollApi.vote(id, selectedOption);

      // Refresh poll data to show updated vote counts
      await fetchPollData(id);

      setShowVoteModal(false);
    } catch (err) {
      console.error('Error submitting vote:', err);
      setVoteError('Failed to submit your vote. Please try again.');
    } finally {
      setVotingInProgress(false);
    }
  };

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

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">Loading poll data...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/polls')}>
          Back to Polls
        </Button>
      </Container>
    );
  }

  if (!poll) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Poll not found.</Alert>
        <Button variant="primary" onClick={() => navigate('/polls')}>
          Back to Polls
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{poll.title}</h2>
            <div>
              {getStatusBadge(poll.status)}
              {canEditPoll && (
                <Button 
                  variant="warning" 
                  className="ms-2"
                  onClick={() => navigate(`/polls/${poll.id}/edit`)}
                >
                  Edit Poll
                </Button>
              )}
              {canManageOptions && (
                <Button 
                  variant="primary" 
                  className="ms-2"
                  onClick={() => navigate(`/polls/${poll.id}/options`)}
                >
                  Manage Options
                </Button>
              )}
              {canStartPoll && (
                <Button 
                  variant="success" 
                  className="ms-2"
                  onClick={handleOpenStartPollModal}
                >
                  Start Poll
                </Button>
              )}
              {canEndPoll && (
                <Button 
                  variant="danger" 
                  className="ms-2"
                  onClick={handleOpenEndPollModal}
                >
                  End Poll
                </Button>
              )}
            </div>
          </div>

          <Card className="mb-4">
            <Card.Body>
              <Card.Text>{poll.description}</Card.Text>
              <div className="d-flex justify-content-between text-muted">
                <small>Created: {new Date(poll.createdAt * 1000).toLocaleString()}</small>
                <small>
                  {poll.plannedStartDate && `Starts: ${new Date(poll.plannedStartDate * 1000).toLocaleString()}`}
                  {poll.plannedEndDate && ` | Ends: ${new Date(poll.plannedEndDate * 1000).toLocaleString()}`}
                </small>
              </div>
            </Card.Body>
          </Card>

          <h4>Options</h4>
          {options.length === 0 ? (
            <Alert variant="info">
              No options have been added to this poll yet.
              {canManageOptions && (
                <div className="mt-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate(`/polls/${poll.id}/options`)}
                  >
                    Add Options
                  </Button>
                </div>
              )}
            </Alert>
          ) : (
            <ListGroup className="mb-4">
              {options.map((option) => (
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

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={() => navigate('/polls')}>
              Back to Polls
            </Button>

            {poll.status === PollStatus.ACTIVE && (
              <>
                {!user && (
                  <Alert variant="info" className="mb-0">
                    Please <Link to="/login">log in</Link> to vote in this poll.
                  </Alert>
                )}

                {user && hasUserVoted && (
                  <Alert variant="info" className="mb-0">
                    You have already voted in this poll.
                  </Alert>
                )}

                {user && !hasUserVoted && options.length === 0 && (
                  <Alert variant="warning" className="mb-0">
                    Voting is not available as there are no options in this poll.
                  </Alert>
                )}

                {user && isAdmin && (
                  <Alert variant="info" className="mb-0">
                    Administrators are not allowed to vote in polls.
                  </Alert>
                )}

                {canVote && (
                  <Button variant="success" onClick={handleOpenVoteModal}>
                    Vote in this Poll
                  </Button>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* Voting Modal */}
      <Modal show={showVoteModal} onHide={handleCloseVoteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Vote in Poll: {poll?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please select one option to cast your vote:</p>

          {voteError && (
            <Alert variant="danger">{voteError}</Alert>
          )}

          <Form>
            {options.map((option) => (
              <Form.Check
                key={option.id}
                type="radio"
                id={`option-${option.id}`}
                label={option.text}
                name="pollOption"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mb-2"
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVoteModal}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleVote} 
            disabled={votingInProgress || !selectedOption}
          >
            {votingInProgress ? 'Submitting...' : 'Submit Vote'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Start Poll Modal */}
      <Modal show={showStartPollModal} onHide={handleCloseStartPollModal}>
        <Modal.Header closeButton>
          <Modal.Title>Start Poll</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to start this poll?</p>
          <p>This will make the poll active and allow users to vote.</p>

          {pollActionError && (
            <Alert variant="danger">{pollActionError}</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStartPollModal}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleStartPoll} 
            disabled={pollActionInProgress}
          >
            {pollActionInProgress ? 'Starting...' : 'Start Poll'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* End Poll Modal */}
      <Modal show={showEndPollModal} onHide={handleCloseEndPollModal}>
        <Modal.Header closeButton>
          <Modal.Title>End Poll</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to end this poll?</p>
          <p>This will mark the poll as finished and prevent any further voting.</p>

          {pollActionError && (
            <Alert variant="danger">{pollActionError}</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEndPollModal}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleEndPoll} 
            disabled={pollActionInProgress}
          >
            {pollActionInProgress ? 'Ending...' : 'End Poll'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PollDetail;
