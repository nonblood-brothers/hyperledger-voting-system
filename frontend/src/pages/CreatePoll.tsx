import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/api.service';

const CreatePoll: React.FC = () => {
  const { isKycVerified } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      
      // Convert dates to timestamps or null
      const startTimestamp = plannedStartDate ? new Date(plannedStartDate).getTime() : null;
      const endTimestamp = plannedEndDate ? new Date(plannedEndDate).getTime() : null;
      
      // Validate dates
      if (startTimestamp && endTimestamp && startTimestamp >= endTimestamp) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }
      
      await pollApi.createPoll(title, description, startTimestamp, endTimestamp);
      
      // Redirect to a page where the user can add questions to the poll
      navigate('/polls', { state: { message: 'Poll created successfully! It will be reviewed by an administrator.' } });
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isKycVerified) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Your account needs to be verified before you can create polls.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="text-center">
              Create New Poll
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="pollTitle">
                  <Form.Label>Poll Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter poll title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="pollDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter poll description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="plannedStartDate">
                      <Form.Label>Planned Start Date (Optional)</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={plannedStartDate}
                        onChange={(e) => setPlannedStartDate(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        If not set, you'll need to start the poll manually.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="plannedEndDate">
                      <Form.Label>Planned End Date (Optional)</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={plannedEndDate}
                        onChange={(e) => setPlannedEndDate(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        If not set, you'll need to end the poll manually.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info">
                  After creating the poll, you'll be able to add voting options. The poll will be submitted for review by an administrator before it becomes active.
                </Alert>

                <div className="d-grid gap-2 mt-4">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Poll'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/polls')}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePoll;