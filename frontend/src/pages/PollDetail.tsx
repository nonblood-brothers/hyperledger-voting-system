import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import { Poll, PollQuestion, PollStatus } from '../types';

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<PollQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      fetchPollData(id);
    }
  }, [id]);
  
  const fetchPollData = async (pollId: string) => {
    try {
      setLoading(true);
      const pollData = await pollApi.getPollById(pollId);
      const questionsData = await pollApi.getPollQuestionsByPollId(pollId);
      
      setPoll(pollData);
      setQuestions(questionsData);
      setError('');
    } catch (err) {
      console.error('Error fetching poll data:', err);
      setError('Failed to load poll data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isAuthor = poll && user && poll.authorStudentIdNumber === user.studentIdNumber;
  const canManageQuestions = isAuthor && [PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll?.status || PollStatus.UNDEFINED);
  
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
              {canManageQuestions && (
                <Button 
                  variant="primary" 
                  className="ms-2"
                  onClick={() => navigate(`/polls/${poll.id}/questions`)}
                >
                  Manage Questions
                </Button>
              )}
            </div>
          </div>
          
          <Card className="mb-4">
            <Card.Body>
              <Card.Text>{poll.description}</Card.Text>
              <div className="d-flex justify-content-between text-muted">
                <small>Created: {new Date(poll.createdAt).toLocaleString()}</small>
                <small>
                  {poll.plannedStartDate && `Starts: ${new Date(poll.plannedStartDate).toLocaleString()}`}
                  {poll.plannedEndDate && ` | Ends: ${new Date(poll.plannedEndDate).toLocaleString()}`}
                </small>
              </div>
            </Card.Body>
          </Card>
          
          <h4>Questions</h4>
          {questions.length === 0 ? (
            <Alert variant="info">
              No questions have been added to this poll yet.
              {canManageQuestions && (
                <div className="mt-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate(`/polls/${poll.id}/questions`)}
                  >
                    Add Questions
                  </Button>
                </div>
              )}
            </Alert>
          ) : (
            <ListGroup className="mb-4">
              {questions.map((question) => (
                <ListGroup.Item 
                  key={question.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>{question.text}</div>
                  <Badge bg="primary" pill>
                    {question.voteCount} votes
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
              <Button variant="success">
                Vote in this Poll
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PollDetail;