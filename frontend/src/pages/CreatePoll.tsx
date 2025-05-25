import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { pollApi } from '../services/poll.service';
import { Poll } from '../types';

interface CreatePollProps {
  isEditMode?: boolean;
}

const CreatePoll: React.FC<CreatePollProps> = ({ isEditMode = false }) => {
  const { isKycVerified } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPoll, setFetchingPoll] = useState(isEditMode);
  const [poll, setPoll] = useState<Poll | null>(null);

  // Fetch poll data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchPollData = async () => {
        try {
          setFetchingPoll(true);
          const pollData = await pollApi.getPollById(id);
          setPoll(pollData);

          // Populate form fields with existing data
          setTitle(pollData.title);
          setDescription(pollData.description);

          if (pollData.plannedStartDate) {
            const startDate = new Date(pollData.plannedStartDate * 1000);
            setPlannedStartDate(startDate.toISOString().slice(0, 16));
          }

          if (pollData.plannedEndDate) {
            const endDate = new Date(pollData.plannedEndDate * 1000);
            setPlannedEndDate(endDate.toISOString().slice(0, 16));
          }

          setError('');
        } catch (err) {
          console.error('Error fetching poll data:', err);
          setError('Failed to load poll data. Please try again.');
          navigate('/polls');
        } finally {
          setFetchingPoll(false);
        }
      };

      fetchPollData();
    }
  }, [isEditMode, id, navigate]);

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
      const startTimestamp = plannedStartDate ? new Date(plannedStartDate).getTime() / 1000 : null;
      const endTimestamp = plannedEndDate ? new Date(plannedEndDate).getTime() / 1000 : null;

      // Validate dates
      if (startTimestamp && endTimestamp && startTimestamp >= endTimestamp) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }

      if (isEditMode && id) {
        // Update existing poll
        await pollApi.updatePoll(id, startTimestamp, endTimestamp, title, description);
        navigate('/polls', { state: { message: 'Poll updated successfully! It will be reviewed by an administrator.' } });
      } else {
        // Create new poll
        await pollApi.createPoll(title, description, startTimestamp, endTimestamp);
        navigate('/polls', { state: { message: 'Poll created successfully! It will be reviewed by an administrator.' } });
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} poll:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} poll. Please try again.`);
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
              {isEditMode ? 'Edit Poll' : 'Create New Poll'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {fetchingPoll && <Alert variant="info">Loading poll data...</Alert>}

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
                  {isEditMode 
                    ? 'Your changes will be submitted for review by an administrator before the poll becomes active again.'
                    : 'After creating the poll, you\'ll be able to add voting options. The poll will be submitted for review by an administrator before it becomes active.'}
                </Alert>

                <div className="d-grid gap-2 mt-4">
                  <Button variant="primary" type="submit" disabled={loading || fetchingPoll}>
                    {loading 
                      ? (isEditMode ? 'Updating...' : 'Creating...') 
                      : (isEditMode ? 'Update Poll' : 'Create Poll')}
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
