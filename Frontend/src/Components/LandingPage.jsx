import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    navigate(`/${role}`);
  };

  return (
    <div className="landing-page-wrapper">
      <div className="landing-page">
        <div className="particles">
          {[...Array(20)].map((_, index) => (
            <div key={index} className={`particle particle-${index + 1}`}></div>
          ))}
        </div>

        <Container fluid className="d-flex align-items-center justify-content-center h-100">
          <Row className="w-100 justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <div className="glass-card text-center py-5 px-4">
                
                <div className="logo-container mb-4">
                  <ClipboardList size={50} className="logo" />
                </div>

                <h1 className="main-title mb-2">SetMyTasks!</h1>
                <h2 className="subtitle mb-3">Your Task Manager</h2>

                <p className="landing-description mb-4 px-2">
                  Manage and assign tasks without the hotch-potch. Streamline your productivity today!
                </p>

                <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-3">
                  <Button 
                    onClick={() => handleNavigation('login-admin')} 
                    className="landing-button admin-btn px-4 py-2"
                    size="lg"
                  >
                    I'm an Admin
                  </Button>

                  <Button 
                    onClick={() => handleNavigation('login-user')} 
                    className="landing-button user-btn px-4 py-2"
                    size="lg"
                  >
                    I'm a User
                  </Button>
                </div>

                <p className="footer-text mt-5 mb-0">
                  This was an assignment submitted to Pan-Science by Nitin Tripathi😄 ✨
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;
