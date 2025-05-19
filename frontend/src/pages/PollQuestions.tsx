import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import { Poll, PollQuestion, PollStatus } from '../types';

const PollQuestions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<PollQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
  
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !newQuestionText.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await pollApi.addPollQuestion(id, newQuestionText.trim());
      
      // Refresh questions list
      const questionsData = await pollApi.getPollQuestionsByPollId(id);
      setQuestions(questionsData);
      
      // Clear form and show success message
      setNewQuestionText('');
      setSuccessMessage('Question added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    if (!id || !questionId) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await pollApi.deletePollQuestion(id, questionId);
      
      // Refresh questions list
      const questionsData = await pollApi.getPollQuestionsByPollId(id);
      setQuestions(questionsData);
      
      // Show success message
      setSuccessMessage('Question deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Check if user is authorized to manage this poll's questions
  const isAuthor = poll && user && poll.authorStudentIdNumber === user.studentIdNumber;
  const canManageQuestions = isAuthor && [PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll?.status || PollStatus.UNDEFINED);
  
  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">Loading poll data...</div>
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
  
  if (!canManageQuestions) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          You don't have permission to manage questions for this poll.
        </Alert>
        <Button variant="primary" onClick={() => navigate(`/polls/${id}`)}>
          Back to Poll
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Manage Questions</h2>
            <Button variant="secondary" onClick={() => navigate(`/polls/${id}`)}>
              Back to Poll
            </Button>
          </div>
          
          <Card className="mb-4">
            <Card.Header>
              <h5>{poll.title}</h5>
            </Card.Header>
            <Card.Body>
              <Card.Text>{poll.description}</Card.Text>
            </Card.Body>
          </Card>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          <Card className="mb-4">
            <Card.Header>
              <h5>Add New Question</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddQuestion}>
                <Form.Group className="mb-3" controlId="questionText">
                  <Form.Label>Question Text</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter question text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={submitting || !newQuestionText.trim()}
                >
                  {submitting ? 'Adding...' : 'Add Question'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <h4>Current Questions</h4>
          {questions.length === 0 ? (
            <Alert variant="info">
              No questions have been added to this poll yet.
            </Alert>
          ) : (
            <ListGroup className="mb-4">
              {questions.map((question) => (
                <ListGroup.Item 
                  key={question.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>{question.text}</div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={submitting}
                  >
                    Delete
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PollQuestions;