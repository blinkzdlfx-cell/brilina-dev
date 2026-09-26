import { Outlet } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import type { Link as LinkType } from '../../lib/types';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';

export default function Layout() {
  const { data: profileData, loading: profileLoading } = useApi(
    () => publicApi.getProfile(),
    []
  );

  const { data: linksData } = useApi(
    () => publicApi.getLinks(),
    []
  );

  if (profileLoading) {
    return (
      <div className="layout">
        <LoadingSpinner />
      </div>
    );
  }

  const profile = profileData?.profile ?? null;
  const images = profileData?.images ?? [];
  const links: LinkType[] = linksData ?? [];

  return (
    <div className="layout">
      <Navbar profile={profile} images={images} links={links} />
      <main className="layout__main" id="main-content">
        <Outlet />
      </main>
      <Footer links={links} profile={profile} />
    </div>
  );
}
