import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import { Poll, PollOption, PollStatus } from '../types';

const PollOptions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [newOptionText, setNewOptionText] = useState('');
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
  
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !newOptionText.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await pollApi.addPollOption(id, newOptionText.trim());
      
      // Refresh options list
      const optionsData = await pollApi.getPollOptionsByPollId(id);
      setOptions(optionsData);
      
      // Clear form and show success message
      setNewOptionText('');
      setSuccessMessage('Option added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error adding option:', err);
      setError('Failed to add option. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteOption = async (optionId: string) => {
    if (!id || !optionId) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await pollApi.deletePollOption(id, optionId);
      
      // Refresh options list
      const optionsData = await pollApi.getPollOptionsByPollId(id);
      setOptions(optionsData);
      
      // Show success message
      setSuccessMessage('Option deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting option:', err);
      setError('Failed to delete option. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Check if user is authorized to manage this poll's options
  const isAuthor = poll && user && poll.authorStudentIdNumber === user.studentIdNumber;
  const canManageOptions = isAuthor && [PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll?.status || PollStatus.UNDEFINED);
  
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
  
  if (!canManageOptions) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          You don't have permission to manage options for this poll.
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
            <h2>Manage Options</h2>
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
              <h5>Add New Option</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddOption}>
                <Form.Group className="mb-3" controlId="optionText">
                  <Form.Label>Option Text</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter option text"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={submitting || !newOptionText.trim()}
                >
                  {submitting ? 'Adding...' : 'Add Option'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <h4>Current Options</h4>
          {options.length === 0 ? (
            <Alert variant="info">
              No options have been added to this poll yet.
            </Alert>
          ) : (
            <ListGroup className="mb-4">
              {options.map((option) => (
                <ListGroup.Item 
                  key={option.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>{option.text}</div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteOption(option.id)}
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

export default PollOptions;