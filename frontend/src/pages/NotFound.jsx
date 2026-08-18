import { Link } from 'react-router-dom';
import '../styles/pages.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-icon">404</div>
          <h1>Page Not Found</h1>
          <p>Sorry, the page you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary btn-large">Go Home</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
