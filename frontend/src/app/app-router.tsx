import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './auth-context';
import { AppShell } from './app-shell';
import { AccessDeniedScreen } from '@/features/stay-smart/components/access-denied-screen';
import { staySmartRoutes } from '@/features/stay-smart/lib/routes';
import { AddListingPage } from '@/features/stay-smart/pages/add-listing-page';
import { CatalogPage } from '@/features/stay-smart/pages/catalog-page';
import { DetailPage } from '@/features/stay-smart/pages/detail-page';
import { HomePage } from '@/features/stay-smart/pages/home-page';
import { HostPage } from '@/features/stay-smart/pages/host-page';
import { ManageObjectPage } from '@/features/stay-smart/pages/manage-object-page';
import { ManageVariantsPage } from '@/features/stay-smart/pages/manage-variants-page';
import { ManagerPage } from '@/features/stay-smart/pages/manager-page';
import { ReservationsPage } from '@/features/stay-smart/pages/reservations-page';
import { ResultsPage } from '@/features/stay-smart/pages/results-page';
import { SavedPage } from '@/features/stay-smart/pages/saved-page';

function RestrictedRoute({
  children,
  allowedRoles,
  title,
  description,
}: {
  children: JSX.Element;
  allowedRoles: Array<'GUEST' | 'HOST' | 'ADMIN'>;
  title: string;
  description: string;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground">Checking access...</p>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDeniedScreen title={title} description={description} />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={staySmartRoutes.home} element={<HomePage />} />
        <Route path={staySmartRoutes.catalog} element={<CatalogPage />} />
        <Route path={staySmartRoutes.results} element={<ResultsPage />} />
        <Route path={staySmartRoutes.property()} element={<DetailPage />} />
        <Route
          path={staySmartRoutes.host}
          element={
            <RestrictedRoute
              allowedRoles={['HOST']}
              title="Host access only"
              description="This area is available only for host accounts."
            >
              <HostPage />
            </RestrictedRoute>
          }
        />
        <Route
          path={staySmartRoutes.addListing}
          element={
            <RestrictedRoute
              allowedRoles={['HOST']}
              title="Host access only"
              description="Only hosts can create and manage listings here."
            >
              <AddListingPage />
            </RestrictedRoute>
          }
        />
        <Route
          path={staySmartRoutes.manageObject()}
          element={
            <RestrictedRoute
              allowedRoles={['HOST']}
              title="Host access only"
              description="Only hosts can update listing details here."
            >
              <ManageObjectPage />
            </RestrictedRoute>
          }
        />
        <Route
          path={staySmartRoutes.manageVariants()}
          element={
            <RestrictedRoute
              allowedRoles={['HOST']}
              title="Host access only"
              description="Only hosts can manage stay variants here."
            >
              <ManageVariantsPage />
            </RestrictedRoute>
          }
        />
        <Route
          path={staySmartRoutes.manager}
          element={
            <RestrictedRoute
              allowedRoles={['ADMIN']}
              title="Manager access only"
              description="This section is available only for manager accounts."
            >
              <ManagerPage />
            </RestrictedRoute>
          }
        />
        <Route
          path={staySmartRoutes.saved}
          element={
            <RestrictedRoute
              allowedRoles={['HOST']}
              title="Host access only"
              description="Only hosts can open listing save confirmation pages."
            >
              <SavedPage />
            </RestrictedRoute>
          }
        />
        <Route
          path={staySmartRoutes.reservations}
          element={
            <RestrictedRoute
              allowedRoles={['GUEST']}
              title="Guest access only"
              description="Reservations are available only for guest accounts."
            >
              <ReservationsPage />
            </RestrictedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={staySmartRoutes.home} replace />} />
    </Routes>
  );
}
