import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/user.service';
import { KycApplicationStatus } from '../../types';

interface KycApplication {
  id: string;
  userId: string;
  status: KycApplicationStatus;
  createdAt: number;
  updatedAt: number;
  user?: {
    firstName: string;
    lastName: string;
    studentIdNumber: string;
  };
}

const KycReview: React.FC = () => {
  const { isAdmin } = useAuth();
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await userApi.getKycApplicationsByStatus(KycApplicationStatus.PENDING);
      setApplications(result.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching KYC applications:', err);
      setError('Failed to load KYC applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: KycApplicationStatus) => {
    try {
      await userApi.updateKycApplicationStatus(id, status);
      setSuccessMessage(`KYC application ${status === KycApplicationStatus.APPROVED ? 'approved' : 'rejected'} successfully.`);

      // Remove the application from the list
      setApplications(applications.filter(app => app.id !== id));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating KYC status:', err);
      setError('Failed to update KYC status. Please try again.');
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
      <h2>KYC Applications Review</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Card className="mt-3">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Pending Applications</h5>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={fetchApplications}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-3">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-3">No pending KYC applications.</div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.userId}</td>
                    <td>
                      {app.user ? `${app.user.firstName} ${app.user.lastName}` : app.userId}
                    </td>
                    <td>{new Date(app.createdAt).toLocaleString()}</td>
                    <td>
                      <Badge bg={
                        app.status === KycApplicationStatus.PENDING ? 'warning' :
                        app.status === KycApplicationStatus.APPROVED ? 'success' :
                        'danger'
                      }>
                        {app.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleUpdateStatus(app.id, KycApplicationStatus.APPROVED)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUpdateStatus(app.id, KycApplicationStatus.REJECTED)}
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

export default KycReview;
