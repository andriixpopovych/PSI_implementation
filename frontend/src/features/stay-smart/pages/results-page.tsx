import { Navigate, useSearchParams } from 'react-router-dom';
import { staySmartRoutes } from '../lib/routes';

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={`${staySmartRoutes.catalog}${query ? `?${query}` : ''}`} replace />;
}
