import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './app-shell';
import { staySmartRoutes } from '@/features/stay-smart/lib/routes';
import { AddListingPage } from '@/features/stay-smart/pages/add-listing-page';
import { CatalogPage } from '@/features/stay-smart/pages/catalog-page';
import { DetailPage } from '@/features/stay-smart/pages/detail-page';
import { HomePage } from '@/features/stay-smart/pages/home-page';
import { HostPage } from '@/features/stay-smart/pages/host-page';
import { ManagerPage } from '@/features/stay-smart/pages/manager-page';
import { ReservationsPage } from '@/features/stay-smart/pages/reservations-page';
import { ResultsPage } from '@/features/stay-smart/pages/results-page';
import { SavedPage } from '@/features/stay-smart/pages/saved-page';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={staySmartRoutes.home} element={<HomePage />} />
        <Route path={staySmartRoutes.catalog} element={<CatalogPage />} />
        <Route path={staySmartRoutes.results} element={<ResultsPage />} />
        <Route path={staySmartRoutes.property()} element={<DetailPage />} />
        <Route path={staySmartRoutes.host} element={<HostPage />} />
        <Route path={staySmartRoutes.addListing} element={<AddListingPage />} />
        <Route path={staySmartRoutes.manager} element={<ManagerPage />} />
        <Route path={staySmartRoutes.saved} element={<SavedPage />} />
        <Route path={staySmartRoutes.reservations} element={<ReservationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={staySmartRoutes.home} replace />} />
    </Routes>
  );
}
